import { Request, Response } from 'express';
import { DoctorModel } from '../models/DoctorModel';
import { UserModel } from '../models/UserModel';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await DoctorModel.getAllDoctorsWithUsers();
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error: any) {
    console.error('Get doctors error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get doctors',
    });
  }
};

export const getDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await DoctorModel.getDoctorWithUser(id);
    
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
    console.error('Get doctor error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get doctor',
    });
  }
};

export const getDoctorsBySpecialization = async (req: Request, res: Response) => {
  try {
    const { specialization } = req.params;
    const doctors = await DoctorModel.findBySpecialization(specialization);
    
    const doctorsWithUsers = await Promise.all(
      doctors.map(async (doctor) => {
        const user = await UserModel.findById(doctor.userId.toString());
        return { ...doctor, user };
      })
    );

    res.status(200).json({
      success: true,
      count: doctorsWithUsers.length,
      data: doctorsWithUsers,
    });
  } catch (error: any) {
    console.error('Get doctors by specialization error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get doctors',
    });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const doctor = await DoctorModel.update(id, updateData);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error: any) {
    console.error('Update doctor error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update doctor',
    });
  }
};

export const searchDoctors = async (req: Request, res: Response) => {
  try {
    const { q, location } = req.query;
    
    let filter: any = {};
    
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { 'roleData.specialization': { $regex: q, $options: 'i' } }
      ];
    }
    
    if (location) {
      filter.address = { $regex: location, $options: 'i' };
    }

    const doctors = await DoctorModel.searchDoctors(filter);
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error: any) {
    console.error('Search doctors error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to search doctors',
    });
  }
};