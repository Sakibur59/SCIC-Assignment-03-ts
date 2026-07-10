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
      {
        $lookup: {
          from: 'users',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient'
        }
      },
      { $unwind: '$patient' },
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      { $project: { 'patient.password': 0, 'doctor.password': 0 } },
      { $sort: { date: 1 } }
    ];

    return await collection.aggregate(pipeline).toArray();
  }
}