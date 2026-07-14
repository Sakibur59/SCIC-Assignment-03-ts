"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getAllUsers = void 0;
const database_1 = require("../config/database");
const mongodb_1 = require("mongodb");
// Helper function for safe ObjectId conversion
const toObjectId = (id) => {
    if (id instanceof mongodb_1.ObjectId)
        return id;
    if (typeof id === 'string')
        return new mongodb_1.ObjectId(id);
    throw new Error('Invalid ID format');
};
const getAllUsers = async (req, res) => {
    try {
        const usersCollection = database_1.db.getCollection('users');
        const users = await usersCollection
            .find({})
            .project({ password: 0 })
            .sort({ createdAt: -1 })
            .toArray();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    }
    catch (error) {
        console.error('❌ Error getting users:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get users',
        });
    }
};
exports.getAllUsers = getAllUsers;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const usersCollection = database_1.db.getCollection('users');
        const user = await usersCollection.findOne({ _id: toObjectId(id) });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const result = await usersCollection.deleteOne({ _id: toObjectId(id) });
        if (result.deletedCount === 0) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (user.role === 'patient') {
            const patientsCollection = database_1.db.getCollection('patients');
            await patientsCollection.deleteMany({ userId: toObjectId(id) });
        }
        if (user.role === 'doctor') {
            const doctorsCollection = database_1.db.getCollection('doctors');
            await doctorsCollection.deleteMany({ userId: toObjectId(id) });
        }
        console.log(`✅ User deleted: ${user.name} (${user.role})`);
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    }
    catch (error) {
        console.error('❌ Error deleting user:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete user',
        });
    }
};
exports.deleteUser = deleteUser;
