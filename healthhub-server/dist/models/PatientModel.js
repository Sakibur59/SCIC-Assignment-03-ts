"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientModel = void 0;
const mongodb_1 = require("mongodb");
const database_1 = require("../config/database");
class PatientModel {
    static async create(patientData) {
        const collection = database_1.db.getCollection(this.collectionName);
        const now = new Date();
        const patient = {
            ...patientData,
            createdAt: now,
            updatedAt: now,
        };
        const result = await collection.insertOne(patient);
        const insertedPatient = await collection.findOne({
            _id: result.insertedId,
        });
        if (!insertedPatient) {
            throw new Error("Patient creation failed");
        }
        return insertedPatient;
    }
    static async findByUserId(userId) {
        const collection = database_1.db.getCollection(this.collectionName);
        const _userId = typeof userId === "string" ? new mongodb_1.ObjectId(userId) : userId;
        return await collection.findOne({ userId: _userId });
    }
    static async update(userId, data) {
        const collection = database_1.db.getCollection(this.collectionName);
        const _userId = typeof userId === "string" ? new mongodb_1.ObjectId(userId) : userId;
        const result = await collection.findOneAndUpdate({ userId: _userId }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: "after" });
        return result;
    }
}
exports.PatientModel = PatientModel;
PatientModel.collectionName = "patients";
