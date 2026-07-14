import { Request, Response } from 'express';
import { db } from '../config/database';
import { ObjectId } from 'mongodb';

// Helper function for safe ObjectId conversion
const toObjectId = (id: string | any): ObjectId => {
  if (id instanceof ObjectId) return id;
  if (typeof id === 'string') return new ObjectId(id);
  throw new Error('Invalid ID format');
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const usersCollection = db.getCollection('users');
    
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

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const usersCollection = db.getCollection('users');
    
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
      const patientsCollection = db.getCollection('patients');
      await patientsCollection.deleteMany({ userId: toObjectId(id) });
    }

    if (user.role === 'doctor') {
      const doctorsCollection = db.getCollection('doctors');
      await doctorsCollection.deleteMany({ userId: toObjectId(id) });
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