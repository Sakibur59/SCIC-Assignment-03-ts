import { ObjectId } from 'mongodb';
import { db } from '../config/database';
import { IPatient } from '../types';

export class PatientModel {
  private static collectionName = 'patients';

  static async create(patientData: Partial<IPatient>): Promise<IPatient> {
    const collection = db.getCollection<IPatient>(this.collectionName);
    
    const now = new Date();
    const patient: IPatient = {
      ...patientData,
      createdAt: now,
      updatedAt: now,
    } as IPatient;

    const result = await collection.insertOne(patient);
    const insertedPatient = await collection.findOne({ _id: result.insertedId });
    
    if (!insertedPatient) {
      throw new Error('Patient creation failed');
    }

    return insertedPatient;
  }

  static async findByUserId(userId: string | ObjectId): Promise<IPatient | null> {
    const collection = db.getCollection<IPatient>(this.collectionName);
    const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return await collection.findOne({ userId: _userId });
  }
}