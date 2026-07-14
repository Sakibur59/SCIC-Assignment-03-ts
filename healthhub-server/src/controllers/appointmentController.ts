import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/database";
import { AppointmentModel } from "../models/AppointmentModel";

export const createAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const { doctorId, date, time, symptoms, notes } = req.body;
    const patientId = req.userId;

    const doctorsCollection = db.getCollection('doctors');
    const doctor = await doctorsCollection.findOne({ _id: new ObjectId(doctorId) });
    const consultationFee = doctor?.consultationFee || 100;

    const appointment = await AppointmentModel.create({
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(doctorId),
      date: new Date(date),
      time,
      symptoms,
      notes,
      consultationFee,
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error: any) {
    console.error("Create appointment error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create appointment",
    });
  }
};

export const getMyAppointments = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const user = req.user;

    let appointments;

    if (user.role === "patient") {
      appointments = await AppointmentModel.getAppointmentsWithDetails(userId);
    } else if (user.role === "doctor") {
      const doctorsCollection = db.getCollection('doctors');
      const doctor = await doctorsCollection.findOne({ userId: new ObjectId(userId) });
      if (doctor) {
        appointments = await AppointmentModel.getAppointmentsWithDetails(undefined, doctor._id);
      } else {
        appointments = [];
      }
    } else {
      appointments = await AppointmentModel.getAppointmentsWithDetails();
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error: any) {
    console.error("Get appointments error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to get appointments",
    });
  }
};

export const updateAppointmentStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;
    const userRole = req.user.role;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    // ✅ FIX: Check if the logged-in user is the doctor
    let isDoctor = false;
    if (userRole === 'doctor') {
      const doctorsCollection = db.getCollection('doctors');
      const doctor = await doctorsCollection.findOne({ userId: new ObjectId(userId) });
      if (doctor && doctor._id.toString() === appointment.doctorId.toString()) {
        isDoctor = true;
      }
    }

    const isPatient = userRole === 'patient' && appointment.patientId.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      res.status(403).json({
        success: false,
        message: "Not authorized to update this appointment",
      });
      return;
    }

    const updatedAppointment = await AppointmentModel.update(id, { status });

    if (!updatedAppointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedAppointment,
    });
  } catch (error: any) {
    console.error("Update appointment status error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update appointment status",
    });
  }
};
export const cancelAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.user.role;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    const isPatient = userRole === 'patient' && appointment.patientId.toString() === userId;
    const isDoctor = userRole === 'doctor' && appointment.doctorId.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      res.status(403).json({
        success: false,
        message: "Not authorized to cancel this appointment",
      });
      return;
    }

    const updatedAppointment = await AppointmentModel.update(id, {
      status: "cancelled",
    });

    if (!updatedAppointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedAppointment,
    });
  } catch (error: any) {
    console.error("Cancel appointment error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel appointment",
    });
  }
};

export const getAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
      return;
    }

    // Authorization check
    if (appointment.patientId.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'doctor') {
      const doctorsCollection = db.getCollection('doctors');
      const doctor = await doctorsCollection.findOne({ userId: new ObjectId(userId) });
      if (doctor && doctor._id.toString() !== appointment.doctorId.toString()) {
        res.status(403).json({
          success: false,
          message: 'Not authorized to view this appointment',
        });
        return;
      }
    }

    // Get doctor details
    const doctorsCollection = db.getCollection('doctors');
    const doctor = await doctorsCollection.findOne({ _id: new ObjectId(appointment.doctorId) });

    let doctorData = {
      name: 'Doctor',
      specialization: 'General Medicine',
      address: '',
      phone: '',
      experience: 0,
      consultationFee: 100,
      rating: 4.5,
    };

    if (doctor) {
      const usersCollection = db.getCollection('users');
      const userData = await usersCollection.findOne({ _id: doctor.userId });

      doctorData = {
        name: userData?.name || 'Doctor',
        specialization: doctor.specialization || 'General Medicine',
        address: userData?.address || '',
        phone: userData?.phone || '',
        experience: doctor.experience || 0,
        consultationFee: doctor.consultationFee || 100,
        rating: doctor.rating || 4.5,
      };
    }

    const usersCollection = db.getCollection('users');
    const patientData = await usersCollection.findOne({ _id: appointment.patientId });

    let patientInfo = {
      name: patientData?.name || 'Patient',
      email: patientData?.email || '',
      phone: patientData?.phone || '',
    };

    res.status(200).json({
      success: true,
      data: {
        ...appointment,
        doctor: doctorData,
        patient: patientInfo,
      },
    });
  } catch (error: any) {
    console.error('Get appointment error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get appointment',
    });
  }
};

export const updateAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.user.role;
    const { date, time, symptoms, notes, doctorId } = req.body;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    const isPatient = userRole === 'patient' && appointment.patientId.toString() === userId;
    const isDoctor = userRole === 'doctor' && appointment.doctorId.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      res.status(403).json({
        success: false,
        message: "Not authorized to update this appointment",
      });
      return;
    }

    let consultationFee = appointment.consultationFee;
    if (doctorId && doctorId !== appointment.doctorId.toString()) {
      const doctorsCollection = db.getCollection('doctors');
      const doctor = await doctorsCollection.findOne({ _id: new ObjectId(doctorId) });
      consultationFee = doctor?.consultationFee || 100;
    }

    const updated = await AppointmentModel.update(id, {
      date: date ? new Date(date) : appointment.date,
      time: time || appointment.time,
      symptoms: symptoms || appointment.symptoms,
      notes: notes || appointment.notes,
      doctorId: doctorId || appointment.doctorId,
      consultationFee: consultationFee,
      status: "pending",
    });

    if (!updated) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("Update appointment error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update appointment",
    });
  }
};