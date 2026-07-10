import { ObjectId } from 'mongodb';
import { db } from '../config/database';
import { IAppointment } from '../types';

export class AppointmentModel {
  private static collectionName = 'appointments';

  static async create(appointmentData: Partial<IAppointment>): Promise<IAppointment> {
    const collection = db.getCollection<IAppointment>(this.collectionName);
    
    const now = new Date();
    const appointment: IAppointment = {
      ...appointmentData,
      status: 'pending',
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

  // ✅ FIXED: Doctor details সহ Appointment আনা
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
      { $match: match },
      // ✅ First get patient from users
      {
        $lookup: {
          from: 'users',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient'
        }
      },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
      
      // ✅ Then get doctor from doctors collection
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },
      
      // ✅ Then get doctor user details from users
      {
        $lookup: {
          from: 'users',
          localField: 'doctorInfo.userId',
          foreignField: '_id',
          as: 'doctorUser'
        }
      },
      { $unwind: { path: '$doctorUser', preserveNullAndEmptyArrays: true } },
      
      // ✅ Final projection
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
          patient: {
            _id: '$patient._id',
            name: '$patient.name',
            email: '$patient.email',
            phone: '$patient.phone'
          },
          doctor: {
            _id: '$doctorUser._id',
            name: '$doctorUser.name',
            email: '$doctorUser.email',
            specialization: '$doctorInfo.specialization',
            address: '$doctorUser.address',
            phone: '$doctorUser.phone',
            profilePicture: '$doctorUser.profilePicture',
            experience: '$doctorInfo.experience',
            consultationFee: '$doctorInfo.consultationFee'
          }
        }
      },
      { $sort: { date: 1 } }
    ];

    return await collection.aggregate(pipeline).toArray();
  }
}