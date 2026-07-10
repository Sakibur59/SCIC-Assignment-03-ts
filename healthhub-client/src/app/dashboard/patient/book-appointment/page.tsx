'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Calendar, Clock, Send, User, MapPin, DollarSign, Star, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookAppointmentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const doctorId = searchParams.get('doctor');
    const { user } = useAuth();

    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        doctorId: doctorId || '',
        date: '',
        time: '',
        symptoms: '',
        notes: '',
    });

    // ✅ Get available time slots based on selected date
    const getAvailableSlots = () => {
        if (!selectedDoctor || !formData.date) return [];

        const dayOfWeek = new Date(formData.date).toLocaleString('en-US', { weekday: 'long' });
        const availability = selectedDoctor.roleData?.availability || [];

        // Check if availability exists for this day
        if (availability.length > 0) {
            const dayAvailability = availability.find((a: any) => a.day === dayOfWeek);
            if (dayAvailability && dayAvailability.slots.length > 0) {
                return dayAvailability.slots;
            }
        }

        // ✅ Fallback: যদি availability না থাকে, default slots দেখাও
        return getDefaultSlots(dayOfWeek);
    };

    // ✅ Default slots based on day
    const getDefaultSlots = (day: string) => {
        const defaultSlots: { [key: string]: string[] } = {
            'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
            'Tuesday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
            'Wednesday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
            'Thursday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
            'Friday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
            'Saturday': ['09:00', '10:00', '11:00'],
            'Sunday': ['09:00', '10:00', '11:00'],
        };

        return defaultSlots[day] || ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    };

    const availableSlots = getAvailableSlots();

    useEffect(() => {
        loadDoctors();
    }, []);

    useEffect(() => {
        if (doctorId && doctors.length > 0) {
            const doctor = doctors.find(d => d._id === doctorId);
            setSelectedDoctor(doctor);
        }
    }, [doctorId, doctors]);

    const loadDoctors = async () => {
        try {
            setLoading(true);
            const response = await api.getDoctors();
            setDoctors(response.data || []);
        } catch (error) {
            console.error('Error loading doctors:', error);
            toast.error('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || user.role !== 'patient') {
            toast.error('Only patients can book appointments');
            return;
        }

        if (!formData.doctorId) {
            toast.error('Please select a doctor');
            return;
        }

        try {
            setSubmitting(true);
            await api.createAppointment({
                doctorId: formData.doctorId,
                date: formData.date,
                time: formData.time,
                symptoms: formData.symptoms,
                notes: formData.notes,
            });
            toast.success('Appointment booked successfully!');
            router.push('/dashboard/patient/appointments');
        } catch (error: any) {
            toast.error(error.message || 'Failed to book appointment');
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Check if doctor has custom availability
    const hasCustomAvailability = () => {
        return selectedDoctor?.roleData?.availability &&
            selectedDoctor.roleData.availability.length > 0;
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Book Appointment</h1>
            <p className="text-gray-500 mb-6">Schedule an appointment with a doctor</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Booking Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Doctor Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Doctor
                                </label>
                                <select
                                    required
                                    value={formData.doctorId}
                                    onChange={(e) => {
                                        const doc = doctors.find(d => d._id === e.target.value);
                                        setSelectedDoctor(doc);
                                        setFormData({ ...formData, doctorId: e.target.value, time: '' });
                                    }}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a doctor</option>
                                    {doctors.map((doc) => (
                                        <option key={doc._id} value={doc._id}>
                                            {doc.name} - {doc.roleData?.specialization || 'General Medicine'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => {
                                                setFormData({ ...formData, date: e.target.value, time: '' });
                                            }}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Time
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <select
                                            required
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                            disabled={!formData.date}
                                        >
                                            <option value="">Select time</option>
                                            {availableSlots.map((slot: string) => (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.date && availableSlots.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            No available slots for this day
                                        </p>
                                    )}
                                    {formData.date && availableSlots.length > 0 && (
                                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            {availableSlots.length} slots available
                                        </p>
                                    )}
                                    {formData.date && !hasCustomAvailability() && (
                                        <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Showing default slots (Doctor has not set availability)
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Symptoms
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.symptoms}
                                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe your symptoms..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Any additional information..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !formData.doctorId || !formData.time}
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
                        </form>
                    </div>
                </div>

                {/* Doctor Info Card */}
                <div>
                    {selectedDoctor ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-24">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
                                    {selectedDoctor.name?.charAt(0) || 'D'}
                                </div>
                                <h3 className="font-semibold text-gray-800 text-lg">{selectedDoctor.name}</h3>
                                <p className="text-sm text-blue-500">{selectedDoctor.roleData?.specialization || 'General Medicine'}</p>
                            </div>

                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{selectedDoctor.roleData?.rating || 4.5} rating</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{selectedDoctor.roleData?.experience || 0} years experience</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{selectedDoctor.address || 'Location not specified'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span>${selectedDoctor.roleData?.consultationFee || 100} consultation fee</span>
                                </div>
                            </div>

                            {/* ✅ Availability Status */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                {hasCustomAvailability() ? (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-2">Available Days:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedDoctor.roleData.availability.map((avail: any) => (
                                                <span key={avail.day} className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full">
                                                    {avail.day}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        No availability set. Showing default slots.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
                            <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">Select a doctor to see details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}