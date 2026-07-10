import { Request, Response } from "express";

import { ObjectId } from "mongodb";
import { AppointmentModel } from "../models/AppointmentModel";

export const createAppointment = async (req: any, res: Response) => {
  try {
    const { doctorId, date, time, symptoms, notes } = req.body;
    const patientId = req.userId;

    const appointment = await AppointmentModel.create({
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(doctorId),
      date: new Date(date),
      time,
      symptoms,
      notes,
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

export const getMyAppointments = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const user = req.user;

    let appointments;

    if (user.role === "patient") {
      appointments = await AppointmentModel.getAppointmentsWithDetails(userId);
    } else if (user.role === "doctor") {
      appointments = await AppointmentModel.getAppointmentsWithDetails(
        undefined,
        userId,
      );
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

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await AppointmentModel.update(id, { status });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error: any) {
    console.error("Update appointment error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update appointment",
    });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await AppointmentModel.update(id, {
      status: "cancelled",
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error: any) {
    console.error("Cancel appointment error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel appointment",
    });
  }
};
export const getAppointment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if user owns this appointment
    if (
      appointment.patientId.toString() !== userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this appointment",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error: any) {
    console.error("Get appointment error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to get appointment",
    });
  }
};

// ✅ Update appointment
export const updateAppointment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { date, time, symptoms, notes, doctorId } = req.body;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if user owns this appointment
    if (
      appointment.patientId.toString() !== userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this appointment",
      });
    }

    const updated = await AppointmentModel.update(id, {
      date: date ? new Date(date) : appointment.date,
      time: time || appointment.time,
      symptoms: symptoms || appointment.symptoms,
      notes: notes || appointment.notes,
      doctorId: doctorId || appointment.doctorId,
      status: "pending", // Reset status on reschedule
    });

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
