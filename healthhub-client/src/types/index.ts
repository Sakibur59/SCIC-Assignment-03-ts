export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  profilePicture?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor extends User {
  roleData?: {
    specialization: string;
    experience: number;
    education: string[];
    availability: {
      day: string;
      slots: string[];
    }[];
    rating: number;
    consultationFee: number;
  };
}

export interface Patient extends User {
  roleData?: {
    dateOfBirth: string;
    bloodGroup?: string;
    medicalHistory?: string[];
    allergies?: string[];
  };
}

export interface Appointment {
  _id?: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  symptoms: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  patient?: User;
  doctor?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'doctor' | 'patient';
  dateOfBirth?: string;
  specialization?: string;
  experience?: number;
  education?: string[];
  consultationFee?: number;
}