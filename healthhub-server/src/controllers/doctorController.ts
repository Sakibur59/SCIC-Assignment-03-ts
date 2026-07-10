import { Request, Response } from 'express';
import { db } from '../config/database';
import { ObjectId } from 'mongodb';

// ✅ Get all doctors
export const getDoctors = async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching all doctors...');
    
    const collection = db.getCollection('doctors');
    const doctors = await collection.find({}).toArray();
    
    console.log(`✅ Found ${doctors.length} doctors`);
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get doctors',
    });
  }
};

// ✅ Get single doctor
export const getDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = db.getCollection('doctors');
    const doctor = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get doctor',
    });
  }
};

// ✅ Get doctors by specialization
export const getDoctorsBySpecialization = async (req: Request, res: Response) => {
  try {
    const { specialization } = req.params;
    const collection = db.getCollection('doctors');
    const doctors = await collection
      .find({ specialization: { $regex: specialization, $options: 'i' } })
      .toArray();
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get doctors',
    });
  }
};

// ✅ Search doctors
export const searchDoctors = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const collection = db.getCollection('doctors');
    
    let filter: any = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { specialization: { $regex: q, $options: 'i' } }
      ];
    }

    const doctors = await collection.find(filter).toArray();
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to search doctors',
    });
  }
};

// ✅ Update doctor
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const collection = db.getCollection('doctors');
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update doctor',
    });
  }
};