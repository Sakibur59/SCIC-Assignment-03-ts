"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePicture = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = require("../models/UserModel");
const PatientModel_1 = require("../models/PatientModel");
const DoctorModel_1 = require("../models/DoctorModel");
// ✅ Fix: JWT sign with proper options
const generateToken = (id, role) => {
    const secret = process.env.JWT_SECRET || 'default_secret_for_dev';
    const expiresIn = process.env.JWT_EXPIRE || '7d';
    const payload = { id, role };
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expiresIn });
};
const register = async (req, res) => {
    try {
        const { name, email, password, role = "patient", dateOfBirth, specialization, experience, education, consultationFee, availability, profilePicture, } = req.body;
        const existingUser = await UserModel_1.UserModel.findByEmail(email);
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
            return;
        }
        const user = await UserModel_1.UserModel.create({
            name,
            email,
            password,
            role,
            profilePicture: profilePicture || "",
        });
        if (role === "patient") {
            await PatientModel_1.PatientModel.create({
                userId: user._id,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
            });
        }
        else if (role === "doctor") {
            await DoctorModel_1.DoctorModel.create({
                userId: user._id,
                specialization: specialization || "General Medicine",
                experience: experience || 0,
                education: education || ["MBBS"],
                consultationFee: consultationFee || 500,
                availability: availability || [],
            });
        }
        const token = generateToken(user._id.toString(), user.role);
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            success: true,
            data: {
                token,
                user: userWithoutPassword,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Registration failed",
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
            return;
        }
        const user = await UserModel_1.UserModel.findByEmail(email);
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        const isPasswordMatch = await UserModel_1.UserModel.comparePassword(user, password);
        if (!isPasswordMatch) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        const token = generateToken(user._id.toString(), user.role);
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            success: true,
            data: {
                token,
                user: userWithoutPassword,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Login failed",
        });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await UserModel_1.UserModel.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        let roleData = null;
        if (user.role === "patient") {
            roleData = await PatientModel_1.PatientModel.findByUserId(userId);
        }
        else if (user.role === "doctor") {
            roleData = await DoctorModel_1.DoctorModel.findByUserId(userId);
        }
        res.status(200).json({
            success: true,
            data: {
                ...user,
                roleData,
            },
        });
    }
    catch (error) {
        console.error("Get me error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to get user data",
        });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, phone, address, profilePicture, dateOfBirth, bloodGroup, allergies, medicalHistory, } = req.body;
        const userUpdateData = {
            name: name || req.user.name,
            phone: phone || req.user.phone,
            address: address || req.user.address,
            updatedAt: new Date(),
        };
        if (profilePicture !== undefined) {
            userUpdateData.profilePicture = profilePicture;
        }
        const updatedUser = await UserModel_1.UserModel.update(userId, userUpdateData);
        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        if (req.user.role === "patient") {
            const patientUpdateData = {
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                bloodGroup: bloodGroup || undefined,
                allergies: allergies || [],
                medicalHistory: medicalHistory || [],
                updatedAt: new Date(),
            };
            Object.keys(patientUpdateData).forEach((key) => {
                if (patientUpdateData[key] === undefined) {
                    delete patientUpdateData[key];
                }
            });
            const PatientModel = require("../models/PatientModel").PatientModel;
            await PatientModel.update(userId, patientUpdateData);
        }
        if (req.user.role === "doctor") {
            const doctorUpdateData = {
                specialization: req.body.specialization,
                experience: req.body.experience,
                education: req.body.education,
                consultationFee: req.body.consultationFee,
                availability: req.body.availability,
                updatedAt: new Date(),
            };
            Object.keys(doctorUpdateData).forEach((key) => {
                if (doctorUpdateData[key] === undefined) {
                    delete doctorUpdateData[key];
                }
            });
            const DoctorModel = require("../models/DoctorModel").DoctorModel;
            await DoctorModel.update(userId, doctorUpdateData);
        }
        const user = await UserModel_1.UserModel.findById(userId);
        let roleData = null;
        if (req.user.role === "patient") {
            const PatientModel = require("../models/PatientModel").PatientModel;
            roleData = await PatientModel.findByUserId(userId);
        }
        else if (req.user.role === "doctor") {
            const DoctorModel = require("../models/DoctorModel").DoctorModel;
            roleData = await DoctorModel.findByUserId(userId);
        }
        res.status(200).json({
            success: true,
            data: {
                ...user,
                roleData,
            },
            message: "Profile updated successfully",
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update profile",
        });
    }
};
exports.updateProfile = updateProfile;
const updateProfilePicture = async (req, res) => {
    try {
        const userId = req.userId;
        const { profilePicture } = req.body;
        if (!profilePicture) {
            res.status(400).json({
                success: false,
                message: "Profile picture is required",
            });
            return;
        }
        const updatedUser = await UserModel_1.UserModel.update(userId, {
            profilePicture: profilePicture,
            updatedAt: new Date(),
        });
        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: updatedUser,
            message: "Profile picture updated successfully",
        });
    }
    catch (error) {
        console.error("Update profile picture error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update profile picture",
        });
    }
};
exports.updateProfilePicture = updateProfilePicture;
