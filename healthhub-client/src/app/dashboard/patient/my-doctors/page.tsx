'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Doctor } from '@/types';
import { Stethoscope, Star, MapPin, Clock, Calendar, MessageSquare, Phone, Mail, Heart, User } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Appointment {
  _id: string;
  doctorId: string;
  doctor?: {
    name: string;
    specialization: string;
    address: string;
    phone: string;
    profilePicture?: string;
  };
  date: string;
  time: string;
  status: string;
}

export default function MyDoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      

      const appointmentsResponse = await api.getMyAppointments();
      const allAppointments = appointmentsResponse.data || [];
      setAppointments(allAppointments);
      const doctorIds = [...new Set(allAppointments.map((apt: any) => apt.doctorId))];
      
      if (doctorIds.length === 0) {
        setDoctors([]);
        setLoading(false);
        return;
      }


      const doctorsResponse = await api.getDoctors();
      const allDoctors = doctorsResponse.data || [];


      const myDoctors = allDoctors.filter((doc: Doctor) => 
        doctorIds.includes(doc._id || '')
      );

      setDoctors(myDoctors);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const getLastAppointment = (doctorId: string) => {
    const doctorAppointments = appointments.filter(apt => apt.doctorId === doctorId);
    if (doctorAppointments.length === 0) return null;
    
    const sorted = doctorAppointments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0];
  };


  const getTotalAppointments = (doctorId: string) => {
    return appointments.filter(apt => apt.doctorId === doctorId).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Doctors</h1>
          <p className="text-gray-500">Doctors you have consulted with</p>
          <p className="text-sm text-blue-500 mt-1">{doctors.length} doctors found</p>
        </div>
        <Link href="/doctors">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Find New Doctor
          </button>
        </Link>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No doctors found</h3>
          <p className="text-gray-400 mt-2">You haven't consulted with any doctors yet.</p>
          <Link href="/doctors">
            <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Find Doctors
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {doctors.map((doctor) => {
            const lastAppointment = getLastAppointment(doctor._id!);
            const totalAppointments = getTotalAppointments(doctor._id!);
            
            return (
              <div
                key={doctor._id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {doctor.name?.charAt(0) || 'D'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{doctor.name}</h3>
                        <p className="text-blue-500 text-sm">{doctor.roleData?.specialization || 'General Medicine'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{doctor.roleData?.rating || 4.5}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{doctor.roleData?.experience || 0} years</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{totalAppointments} visits</span>
                      </div>
                    </div>

                    {doctor.address && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{doctor.address}</span>
                      </div>
                    )}

                    {lastAppointment && (
                      <p className="text-xs text-gray-400 mt-2">
                        Last visit: {new Date(lastAppointment.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Link href={`/appointment?doctor=${doctor._id}`}>
                        <button className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                          Book Appointment
                        </button>
                      </Link>
                      
                      {doctor.phone && (
                        <a href={`tel:${doctor.phone}`} className="text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}