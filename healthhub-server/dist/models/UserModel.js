"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongodb_1 = require("mongodb");
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserModel {
    static async create(userData) {
        const collection = database_1.db.getCollection(this.collectionName);
        if (userData.password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            userData.password = await bcryptjs_1.default.hash(userData.password, salt);
        }
        const now = new Date();
        const user = {
            ...userData,
            profilePicture: userData.profilePicture || '',
            createdAt: now,
            updatedAt: now,
        };
        const result = await collection.insertOne(user);
        const insertedUser = await collection.findOne({ _id: result.insertedId });
        if (!insertedUser) {
            throw new Error('User creation failed');
        }
        return insertedUser;
    }
    static async findByEmail(email) {
        const collection = database_1.db.getCollection(this.collectionName);
        return await collection.findOne({ email });
    }
    static async findById(id) {
        const collection = database_1.db.getCollection(this.collectionName);
        const _id = typeof id === 'string' ? new mongodb_1.ObjectId(id) : id;
        return await collection.findOne({ _id }, { projection: { password: 0 } });
    }
    static async update(id, data) {
        const collection = database_1.db.getCollection(this.collectionName);
        const _id = typeof id === 'string' ? new mongodb_1.ObjectId(id) : id;
        // If password is being updated, hash it
        if (data.password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            data.password = await bcryptjs_1.default.hash(data.password, salt);
        }
        const result = await collection.findOneAndUpdate({ _id }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: 'after' });
        if (!result) {
            return null;
        }
        const { password, ...userWithoutPassword } = result;
        return userWithoutPassword;
    }
    static async comparePassword(user, candidatePassword) {
        return await bcryptjs_1.default.compare(candidatePassword, user.password);
    }
}
exports.UserModel = UserModel;
UserModel.collectionName = 'users';
