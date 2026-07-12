import { ObjectId } from 'mongodb';

export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'patient';
  profilePicture?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctor {
  _id?: ObjectId;
  userId: ObjectId;
  specialization: string;
  experience: number;
  education: string[];
  availability: {
    day: string;
    slots: string[];
  }[];
  rating: number;
  consultationFee: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPatient {
  _id?: ObjectId;
  userId: ObjectId;
  dateOfBirth: Date;
  bloodGroup?: string;
  medicalHistory?: string[];
  allergies?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointment {
  _id?: ObjectId;
  patientId: ObjectId;
  doctorId: ObjectId;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  symptoms: string;
  notes?: string;
  consultationFee: number;
  paymentIntentId?: string;
  paymentStatus?: string;
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'doctor' | 'patient';
  dateOfBirth?: string;
  specialization?: string;
  experience?: number;
  education?: string[];
  consultationFee?: number;
  availability?: { day: string; slots: string[] }[];
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}