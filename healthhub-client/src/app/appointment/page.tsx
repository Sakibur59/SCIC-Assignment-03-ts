'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { Doctor } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, User, Stethoscope, MapPin, DollarSign, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AppointmentPage() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctor');
  const { isAuthenticated, user } = useAuth();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: doctorId || '',
    date: '',
    time: '',
    symptoms: '',
    notes: '',
  });

  useEffect(() => {
    if (doctorId) {
      loadDoctor(doctorId);
    }
  }, [doctorId]);

  const loadDoctor = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.getDoctor(id);
      setDoctor(response.data);
      setFormData(prev => ({ ...prev, doctorId: id }));
    } catch (error) {
      console.error('Error loading doctor:', error);
      toast.error('Doctor not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment');
      return;
    }

    try {
      setSubmitting(true);
      await api.createAppointment(formData);
      setSuccess(true);
      toast.success('Appointment booked successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!doctor) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700">Doctor not found</h2>
            <p className="text-gray-500 mt-2">Please select a valid doctor</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Book Appointment</h1>

          {success ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Appointment Booked!</h2>
              <p className="text-gray-500 mt-2">Your appointment has been confirmed.</p>
              <p className="text-sm text-gray-400 mt-4">You will receive a confirmation email shortly.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Doctor Info */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mx-auto">
                    {doctor.name?.charAt(0) || 'D'}
                  </div>
                  <h3 className="text-center font-semibold text-gray-800 mt-4">{doctor.name}</h3>
                  <p className="text-center text-blue-500 text-sm">{doctor.roleData?.specialization}</p>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{doctor.roleData?.rating || 4.5} rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{doctor.roleData?.experience || 0} years experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{doctor.address || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>${doctor.roleData?.consultationFee || 100} consultation fee</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Appointment Details</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Appointment Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Appointment Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="time"
                            required
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Symptoms
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Describe your symptoms..."
                        value={formData.symptoms}
                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Any additional information..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !isAuthenticated}
                      className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Booking...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Book Appointment
                        </>
                      )}
                    </button>

                    {!isAuthenticated && (
                      <p className="text-center text-sm text-red-500">
                        Please <a href="/login" className="text-blue-500 hover:underline">login</a> to book an appointment
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}