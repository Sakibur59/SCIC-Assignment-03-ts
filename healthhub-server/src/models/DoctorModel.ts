import { ObjectId } from "mongodb";
import { db } from "../config/database";
import { IDoctor } from "../types";

export class DoctorModel {
  private static collectionName = "doctors";

  static async create(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    const collection = db.getCollection<IDoctor>(this.collectionName);

    const now = new Date();
    const doctor: IDoctor = {
      ...doctorData,
      rating: 0,
      availability: doctorData.availability || [],  
      createdAt: now,
      updatedAt: now,
    } as IDoctor;

    const result = await collection.insertOne(doctor);
    const insertedDoctor = await collection.findOne({ _id: result.insertedId });

    if (!insertedDoctor) {
      throw new Error("Doctor creation failed");
    }

    return insertedDoctor;
  }

  static async findByUserId(
    userId: string | ObjectId,
  ): Promise<IDoctor | null> {
    const collection = db.getCollection<IDoctor>(this.collectionName);
    const _userId = typeof userId === "string" ? new ObjectId(userId) : userId;
    return await collection.findOne({ userId: _userId });
  }

  static async findAll(): Promise<IDoctor[]> {
    const collection = db.getCollection<IDoctor>(this.collectionName);
    return await collection.find().toArray();
  }

  static async findBySpecialization(
    specialization: string,
  ): Promise<IDoctor[]> {
    const collection = db.getCollection<IDoctor>(this.collectionName);
    return await collection
      .find({ specialization: { $regex: specialization, $options: "i" } })
      .toArray();
  }

  static async update(
    userId: string | ObjectId,
    data: Partial<IDoctor>,
  ): Promise<IDoctor | null> {
    const collection = db.getCollection<IDoctor>(this.collectionName);
    const _userId = typeof userId === "string" ? new ObjectId(userId) : userId;

    const result = await collection.findOneAndUpdate(
      { userId: _userId },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

    return result;
  }

  static async getDoctorWithUser(userId: string | ObjectId): Promise<any> {
    const collection = db.getCollection<IDoctor>(this.collectionName);
    const _userId = typeof userId === "string" ? new ObjectId(userId) : userId;

    const pipeline = [
      { $match: { userId: _userId } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $project: { "user.password": 0 } },
    ];

    const result = await collection.aggregate(pipeline).toArray();
    return result[0] || null;
  }

  static async searchDoctors(filter: any): Promise<any[]> {
    const collection = db.getCollection<IDoctor>(this.collectionName);

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: filter },
      { $project: { "user.password": 0 } },
      { $sort: { rating: -1 } },
    ];

    return await collection.aggregate(pipeline).toArray();
  }
  static async getAllDoctorsWithUsers(): Promise<any[]> {
    const collection = db.getCollection<IDoctor>(this.collectionName);

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $project: { "user.password": 0 } },
    ];

    return await collection.aggregate(pipeline).toArray();
  }
}
