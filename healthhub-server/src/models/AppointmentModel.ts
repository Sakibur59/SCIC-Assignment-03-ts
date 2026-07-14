import { ObjectId } from 'mongodb';
import { db } from '../config/database';

export interface IAppointment {
  _id?: ObjectId;
  patientId: ObjectId;
  doctorId: ObjectId;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  symptoms: string;
  notes?: string;
  consultationFee: number;
  paymentIntentId?: string;
  paymentStatus?: string;
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class AppointmentModel {
  private static collectionName = 'appointments';

  static async create(appointmentData: Partial<IAppointment>): Promise<IAppointment> {
    const collection = db.getCollection<IAppointment>(this.collectionName);
    
    const now = new Date();
    const appointment: IAppointment = {
      ...appointmentData,
      status: 'pending',
      consultationFee: appointmentData.consultationFee || 0,
      createdAt: now,
      updatedAt: now,
    } as IAppointment;

    const result = await collection.insertOne(appointment);
    const insertedAppointment = await collection.findOne({ _id: result.insertedId });
    
    if (!insertedAppointment) {
      throw new Error('Appointment creation failed');
    }

    return insertedAppointment;
  }

  static async findById(id: string | ObjectId): Promise<IAppointment | null> {
    const collection = db.getCollection<IAppointment>(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id });
  }

  static async findByPatient(patientId: string | ObjectId): Promise<IAppointment[]> {
    const collection = db.getCollection<IAppointment>(this.collectionName);
    const _patientId = typeof patientId === 'string' ? new ObjectId(patientId) : patientId;
    return await collection
      .find({ patientId: _patientId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findByDoctor(doctorId: string | ObjectId): Promise<IAppointment[]> {
    const collection = db.getCollection<IAppointment>(this.collectionName);
    const _doctorId = typeof doctorId === 'string' ? new ObjectId(doctorId) : doctorId;
    return await collection
      .find({ doctorId: _doctorId })
      .sort({ date: 1 })
      .toArray();
  }

  static async update(id: string | ObjectId, data: Partial<IAppointment>): Promise<IAppointment | null> {
    const collection = db.getCollection<IAppointment>(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.findOneAndUpdate(
      { _id },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return result;
  }

  static async getAppointmentsWithDetails(patientId?: string | ObjectId, doctorId?: string | ObjectId): Promise<any[]> {
    const collection = db.getCollection<IAppointment>(this.collectionName);
    
    const match: any = {};
    if (patientId) {
      match.patientId = typeof patientId === 'string' ? new ObjectId(patientId) : patientId;
    }
    if (doctorId) {
      match.doctorId = typeof doctorId === 'string' ? new ObjectId(doctorId) : doctorId;
    }

    const pipeline = [
      // Step 1: Match appointments
      { $match: match },
      
      // Step 2: Get patient info from users
      {
        $lookup: {
          from: 'users',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patientData'
        }
      },
      { $unwind: { path: '$patientData', preserveNullAndEmptyArrays: true } },
      
      // Step 3: Get doctor info from doctors collection
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },
      
      // Step 4: Get doctor user details from users (using doctorInfo.userId)
      {
        $lookup: {
          from: 'users',
          localField: 'doctorInfo.userId',
          foreignField: '_id',
          as: 'doctorUser'
        }
      },
      { $unwind: { path: '$doctorUser', preserveNullAndEmptyArrays: true } },
      
      // Step 5: Final projection with proper doctor details
      {
        $project: {
          _id: 1,
          patientId: 1,
          doctorId: 1,
          date: 1,
          time: 1,
          status: 1,
          symptoms: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
          consultationFee: 1,
          paymentIntentId: 1,
          paymentStatus: 1,
          amount: 1,
          patient: {
            _id: '$patientData._id',
            name: { $ifNull: ['$patientData.name', 'Patient'] },
            email: '$patientData.email',
            phone: { $ifNull: ['$patientData.phone', ''] },
            address: { $ifNull: ['$patientData.address', ''] }
          },
          doctor: {
            _id: '$doctorUser._id',
            name: { $ifNull: ['$doctorUser.name', 'Doctor'] },
            email: '$doctorUser.email',
            specialization: { $ifNull: ['$doctorInfo.specialization', 'General Medicine'] },
            address: { $ifNull: ['$doctorUser.address', ''] },
            phone: { $ifNull: ['$doctorUser.phone', ''] },
            profilePicture: '$doctorUser.profilePicture',
            experience: { $ifNull: ['$doctorInfo.experience', 0] },
            consultationFee: { $ifNull: ['$doctorInfo.consultationFee', 100] },
            rating: { $ifNull: ['$doctorInfo.rating', 4.5] }
          }
        }
      },
      { $sort: { date: -1 } }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    console.log(`📊 Found ${result.length} appointments with doctor details`);
    
    // ✅ Log first appointment doctor name for debugging
    if (result.length > 0) {
      console.log('👨‍⚕️ First doctor name:', result[0]?.doctor?.name);
    }
    
    return result;
  }
}