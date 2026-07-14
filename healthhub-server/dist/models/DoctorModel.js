"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorModel = void 0;
const mongodb_1 = require("mongodb");
const database_1 = require("../config/database");
class DoctorModel {
    static async create(doctorData) {
        const collection = database_1.db.getCollection(this.collectionName);
        const now = new Date();
        const doctor = {
            ...doctorData,
            rating: 0,
            availability: doctorData.availability || [],
            createdAt: now,
            updatedAt: now,
        };
        const result = await collection.insertOne(doctor);
        const insertedDoctor = await collection.findOne({ _id: result.insertedId });
        if (!insertedDoctor) {
            throw new Error("Doctor creation failed");
        }
        return insertedDoctor;
    }
    static async findByUserId(userId) {
        const collection = database_1.db.getCollection(this.collectionName);
        const _userId = typeof userId === "string" ? new mongodb_1.ObjectId(userId) : userId;
        return await collection.findOne({ userId: _userId });
    }
    static async findAll() {
        const collection = database_1.db.getCollection(this.collectionName);
        return await collection.find().toArray();
    }
    static async findBySpecialization(specialization) {
        const collection = database_1.db.getCollection(this.collectionName);
        return await collection
            .find({ specialization: { $regex: specialization, $options: "i" } })
            .toArray();
    }
    static async update(userId, data) {
        const collection = database_1.db.getCollection(this.collectionName);
        const _userId = typeof userId === "string" ? new mongodb_1.ObjectId(userId) : userId;
        const result = await collection.findOneAndUpdate({ userId: _userId }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: "after" });
        return result;
    }
    static async getDoctorWithUser(userId) {
        const collection = database_1.db.getCollection(this.collectionName);
        const _userId = typeof userId === "string" ? new mongodb_1.ObjectId(userId) : userId;
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
    static async searchDoctors(filter) {
        const collection = database_1.db.getCollection(this.collectionName);
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
    static async getAllDoctorsWithUsers() {
        const collection = database_1.db.getCollection(this.collectionName);
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
exports.DoctorModel = DoctorModel;
DoctorModel.collectionName = "doctors";
