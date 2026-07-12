import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel";
import { PatientModel } from "../models/PatientModel";
import { DoctorModel } from "../models/DoctorModel";
import { RegisterRequest, LoginRequest } from "../types";
import { ObjectId } from "mongodb";

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role = "patient",
      dateOfBirth,
      specialization,
      experience,
      education,
      consultationFee,
      availability,
    } = req.body as RegisterRequest;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      role,
    });

    if (role === "patient") {
      await PatientModel.create({
        userId: user._id!,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
      });
    } else if (role === "doctor") {
      await DoctorModel.create({
        userId: user._id!,
        specialization: specialization || "General Medicine",
        experience: experience || 0,
        education: education || ["MBBS"],
        consultationFee: consultationFee || 500,
        availability: availability || [],
      });
    }

    const token = generateToken(user._id!.toString(), user.role);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordMatch = await UserModel.comparePassword(user, password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id!.toString());
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    let roleData = null;
    if (user.role === "patient") {
      roleData = await PatientModel.findByUserId(userId);
    } else if (user.role === "doctor") {
      roleData = await DoctorModel.findByUserId(userId);
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        roleData,
      },
    });
  } catch (error: any) {
    console.error("Get me error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to get user data",
    });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const {
      name,
      phone,
      address,
      dateOfBirth,
      bloodGroup,
      allergies,
      medicalHistory,
    } = req.body;

    // ✅ Update user basic info
    const userUpdateData: any = {
      name: name || req.user.name,
      phone: phone || req.user.phone,
      address: address || req.user.address,
      updatedAt: new Date(),
    };

    const updatedUser = await UserModel.update(userId, userUpdateData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Update patient profile (if role is patient)
    if (req.user.role === "patient") {
      const patientUpdateData: any = {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        bloodGroup: bloodGroup || undefined,
        allergies: allergies || [],
        medicalHistory: medicalHistory || [],
        updatedAt: new Date(),
      };

      // Remove undefined fields
      Object.keys(patientUpdateData).forEach((key) => {
        if (patientUpdateData[key] === undefined) {
          delete patientUpdateData[key];
        }
      });

      const PatientModel = require("../models/PatientModel").PatientModel;
      await PatientModel.update(userId, patientUpdateData);
    }

    // ✅ Get updated user with role data
    const user = await UserModel.findById(userId);
    let roleData = null;
    if (req.user.role === "patient") {
      const PatientModel = require("../models/PatientModel").PatientModel;
      roleData = await PatientModel.findByUserId(userId);
    } else if (req.user.role === "doctor") {
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
  } catch (error: any) {
    console.error("Update profile error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};
