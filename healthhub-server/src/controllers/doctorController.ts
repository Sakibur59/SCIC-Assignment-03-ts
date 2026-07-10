import { Request, Response } from 'express';
import { db } from '../config/database';
import { ObjectId } from 'mongodb';
export const getDoctors = async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching all doctors...');
    
    const collection = db.getCollection('doctors');
    const doctors = await collection.find({}).toArray();

    const formattedDoctors = doctors.map((doc: any) => ({
      _id: doc._id,
      name: doc.name || 'Doctor',
      email: doc.email || '',
      role: 'doctor',
      address: doc.address || '',
      phone: doc.phone || '',
      profilePicture: doc.profilePicture || '',
      roleData: {
        specialization: doc.specialization || 'General Medicine',
        experience: doc.experience || 0,
        education: doc.education || ['MBBS'],
        availability: doc.availability || [],
        rating: doc.rating || 0,
        consultationFee: doc.consultationFee || 0
      }
    }));
    
    console.log(`✅ Found ${formattedDoctors.length} doctors`);
    
    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get doctors',
    });
  }
};
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
    const formattedDoctor = {
      _id: doctor._id,
      name: doctor.name || 'Doctor',
      email: doctor.email || '',
      role: 'doctor',
      address: doctor.address || '',
      phone: doctor.phone || '',
      profilePicture: doctor.profilePicture || '',
      roleData: {
        specialization: doctor.specialization || 'General Medicine',
        experience: doctor.experience || 0,
        education: doctor.education || ['MBBS'],
        availability: doctor.availability || [],
        rating: doctor.rating || 0,
        consultationFee: doctor.consultationFee || 0
      }
    };

    res.status(200).json({
      success: true,
      data: formattedDoctor,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get doctor',
    });
  }
};
export const getDoctorsBySpecialization = async (req: Request, res: Response) => {
  try {
    const { specialization } = req.params;
    const collection = db.getCollection('doctors');
    const doctors = await collection
      .find({ specialization: { $regex: specialization, $options: 'i' } })
      .toArray();
    
    const formattedDoctors = doctors.map((doc: any) => ({
      _id: doc._id,
      name: doc.name || 'Doctor',
      email: doc.email || '',
      role: 'doctor',
      address: doc.address || '',
      phone: doc.phone || '',
      profilePicture: doc.profilePicture || '',
      roleData: {
        specialization: doc.specialization || 'General Medicine',
        experience: doc.experience || 0,
        education: doc.education || ['MBBS'],
        availability: doc.availability || [],
        rating: doc.rating || 0,
        consultationFee: doc.consultationFee || 0
      }
    }));
    
    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get doctors',
    });
  }
};
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
    

    const formattedDoctors = doctors.map((doc: any) => ({
      _id: doc._id,
      name: doc.name || 'Doctor',
      email: doc.email || '',
      role: 'doctor',
      address: doc.address || '',
      phone: doc.phone || '',
      profilePicture: doc.profilePicture || '',
      roleData: {
        specialization: doc.specialization || 'General Medicine',
        experience: doc.experience || 0,
        education: doc.education || ['MBBS'],
        availability: doc.availability || [],
        rating: doc.rating || 0,
        consultationFee: doc.consultationFee || 0
      }
    }));
    
    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to search doctors',
    });
  }
};

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

    const formattedDoctor = {
      _id: result._id,
      name: result.name || 'Doctor',
      email: result.email || '',
      role: 'doctor',
      address: result.address || '',
      phone: result.phone || '',
      profilePicture: result.profilePicture || '',
      roleData: {
        specialization: result.specialization || 'General Medicine',
        experience: result.experience || 0,
        education: result.education || ['MBBS'],
        availability: result.availability || [],
        rating: result.rating || 0,
        consultationFee: result.consultationFee || 0
      }
    };

    res.status(200).json({
      success: true,
      data: formattedDoctor,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update doctor',
    });
  }
};