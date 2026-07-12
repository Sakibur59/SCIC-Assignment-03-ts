import { Request, Response } from 'express';
import { db } from '../config/database';
import { ObjectId } from 'mongodb';

// ✅ Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const usersCollection = db.getCollection('users');
    
    // ✅ Get all users except password
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
  } catch (error: any) {
    console.error('❌ Error getting users:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get users',
    });
  }
};

// ✅ Delete user (already exists)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const usersCollection = db.getCollection('users');
    
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete from users collection
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If user is a patient, also delete from patients collection
    if (user.role === 'patient') {
      const patientsCollection = db.getCollection('patients');
      await patientsCollection.deleteMany({ userId: new ObjectId(id) });
    }

    // If user is a doctor, also delete from doctors collection
    if (user.role === 'doctor') {
      const doctorsCollection = db.getCollection('doctors');
      await doctorsCollection.deleteMany({ userId: new ObjectId(id) });
    }

    console.log(`✅ User deleted: ${user.name} (${user.role})`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Error deleting user:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete user',
    });
  }
};