"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointment = exports.getAppointment = exports.cancelAppointment = exports.updateAppointmentStatus = exports.getMyAppointments = exports.createAppointment = void 0;
const mongodb_1 = require("mongodb");
const database_1 = require("../config/database");
const AppointmentModel_1 = require("../models/AppointmentModel");
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, symptoms, notes } = req.body;
        const patientId = req.userId;
        const doctorsCollection = database_1.db.getCollection('doctors');
        const doctor = await doctorsCollection.findOne({ _id: new mongodb_1.ObjectId(doctorId) });
        const consultationFee = doctor?.consultationFee || 100;
        const appointment = await AppointmentModel_1.AppointmentModel.create({
            patientId: new mongodb_1.ObjectId(patientId),
            doctorId: new mongodb_1.ObjectId(doctorId),
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
    }
    catch (error) {
        console.error("Create appointment error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create appointment",
        });
    }
};
exports.createAppointment = createAppointment;
const getMyAppointments = async (req, res) => {
    try {
        const userId = req.userId;
        const user = req.user;
        let appointments;
        if (user.role === "patient") {
            appointments = await AppointmentModel_1.AppointmentModel.getAppointmentsWithDetails(userId);
        }
        else if (user.role === "doctor") {
            const doctorsCollection = database_1.db.getCollection('doctors');
            const doctor = await doctorsCollection.findOne({ userId: new mongodb_1.ObjectId(userId) });
            if (doctor) {
                appointments = await AppointmentModel_1.AppointmentModel.getAppointmentsWithDetails(undefined, doctor._id);
            }
            else {
                appointments = [];
            }
        }
        else {
            appointments = await AppointmentModel_1.AppointmentModel.getAppointmentsWithDetails();
        }
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    }
    catch (error) {
        console.error("Get appointments error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to get appointments",
        });
    }
};
exports.getMyAppointments = getMyAppointments;
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.userId;
        const userRole = req.user.role;
        const appointment = await AppointmentModel_1.AppointmentModel.findById(id);
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
            const doctorsCollection = database_1.db.getCollection('doctors');
            const doctor = await doctorsCollection.findOne({ userId: new mongodb_1.ObjectId(userId) });
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
        const updatedAppointment = await AppointmentModel_1.AppointmentModel.update(id, { status });
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
    }
    catch (error) {
        console.error("Update appointment status error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update appointment status",
        });
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.user.role;
        const appointment = await AppointmentModel_1.AppointmentModel.findById(id);
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
        const updatedAppointment = await AppointmentModel_1.AppointmentModel.update(id, {
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
    }
    catch (error) {
        console.error("Cancel appointment error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to cancel appointment",
        });
    }
};
exports.cancelAppointment = cancelAppointment;
const getAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const appointment = await AppointmentModel_1.AppointmentModel.findById(id);
        if (!appointment) {
            res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
            return;
        }
        // Authorization check
        if (appointment.patientId.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'doctor') {
            const doctorsCollection = database_1.db.getCollection('doctors');
            const doctor = await doctorsCollection.findOne({ userId: new mongodb_1.ObjectId(userId) });
            if (doctor && doctor._id.toString() !== appointment.doctorId.toString()) {
                res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this appointment',
                });
                return;
            }
        }
        // Get doctor details
        const doctorsCollection = database_1.db.getCollection('doctors');
        const doctor = await doctorsCollection.findOne({ _id: new mongodb_1.ObjectId(appointment.doctorId) });
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
            const usersCollection = database_1.db.getCollection('users');
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
        const usersCollection = database_1.db.getCollection('users');
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
    }
    catch (error) {
        console.error('Get appointment error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get appointment',
        });
    }
};
exports.getAppointment = getAppointment;
const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.user.role;
        const { date, time, symptoms, notes, doctorId } = req.body;
        const appointment = await AppointmentModel_1.AppointmentModel.findById(id);
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
            const doctorsCollection = database_1.db.getCollection('doctors');
            const doctor = await doctorsCollection.findOne({ _id: new mongodb_1.ObjectId(doctorId) });
            consultationFee = doctor?.consultationFee || 100;
        }
        const updated = await AppointmentModel_1.AppointmentModel.update(id, {
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
    }
    catch (error) {
        console.error("Update appointment error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update appointment",
        });
    }
};
exports.updateAppointment = updateAppointment;
