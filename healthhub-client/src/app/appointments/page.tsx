'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar, Clock, MapPin,
  CheckCircle, XCircle, Clock as ClockIcon,
  CalendarX, CalendarClock
} from 'lucide-react';
import { CancelModal } from '@/components/CancelModal';
import toast from 'react-hot-toast';

interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  symptoms: string;
  notes?: string;
  createdAt: string;
  doctor?: {
    name: string;
    specialization: string;
    address: string;
    phone: string;
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Cancel Modal State
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    appointmentId: string | null;
    doctorName: string;
    date: string;
    time: string;
    loading: boolean;
  }>({
    isOpen: false,
    appointmentId: null,
    doctorName: '',
    date: '',
    time: '',
    loading: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'patient') {
      router.push('/dashboard');
      return;
    }

    loadAppointments();
  }, [isAuthenticated, user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.getMyAppointments();
      console.log('📋 Appointments:', response.data);
      setAppointments(response.data || []);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      toast.error(error.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><ClockIcon className="h-3 w-3 mr-1" /> Pending</span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Cancelled</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" /> Completed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-yellow-400';
      case 'confirmed': return 'border-green-400';
      case 'cancelled': return 'border-red-400';
      case 'completed': return 'border-blue-400';
      default: return 'border-gray-400';
    }
  };

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === filter);

  // Cancel with Modal
  const handleCancelClick = (appointment: Appointment) => {
    setCancelModal({
      isOpen: true,
      appointmentId: appointment._id,
      doctorName: appointment.doctor?.name || 'Doctor',
      date: new Date(appointment.date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: appointment.time,
      loading: false,
    });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.appointmentId) return;

    setCancelModal(prev => ({ ...prev, loading: true }));

    try {
      await api.cancelAppointment(cancelModal.appointmentId);
      toast.success('Appointment cancelled successfully');
      setCancelModal(prev => ({ ...prev, isOpen: false, loading: false }));
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel appointment');
      setCancelModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Reschedule - Only for non-cancelled appointments
  const handleReschedule = (appointment: Appointment) => {
    const params = new URLSearchParams({
      doctor: appointment.doctorId,
      date: appointment.date.split('T')[0],
      time: appointment.time,
      symptoms: appointment.symptoms || '',
      notes: appointment.notes || '',
      reschedule: 'true',
      appointmentId: appointment._id,
    });
    router.push(`/appointment?${params.toString()}`);
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="text-blue-100 mt-2">View and manage all your appointments</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{appointments.filter(a => a.status === 'pending').length}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{appointments.filter(a => a.status === 'confirmed').length}</div>
              <div className="text-sm text-gray-500">Confirmed</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{appointments.filter(a => a.status === 'completed').length}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600">No appointments found</h3>
              <p className="text-gray-400 mt-2">
                {filter === 'all'
                  ? 'You haven\'t booked any appointments yet.'
                  : `No ${filter} appointments found.`}
              </p>
              <button
                onClick={() => router.push('/doctors')}
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Book an Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const isCancelled = appointment.status === 'cancelled';
                const isCompleted = appointment.status === 'completed';
                const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed';
                const canReschedule = !isCancelled && !isCompleted;

                return (
                  <div
                    key={appointment._id}
                    className={`bg-white rounded-xl shadow-sm border-l-4 ${getStatusColor(appointment.status)} p-6 hover:shadow-md transition-shadow ${isCancelled ? 'opacity-75' : ''
                      }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left - Doctor Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                          {appointment.doctor?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {appointment.doctor?.name || 'Doctor'}
                          </h3>
                          <p className="text-sm text-blue-500">
                            {appointment.doctor?.specialization || 'General Medicine'}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {appointment.time}
                            </span>
                          </div>
                          {appointment.doctor?.address && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {appointment.doctor.address}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right - Status & Actions */}
                      <div className="flex flex-col items-end gap-3">
                        {getStatusBadge(appointment.status)}
                        <div className="flex gap-2">
                          {canCancel && (
                            <button
                              onClick={() => handleCancelClick(appointment)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 border border-red-200 hover:border-red-300 shadow-sm hover:shadow"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </button>
                          )}

                          
                          {canReschedule && (
                            <button
                              onClick={() => handleReschedule(appointment)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow"
                            >
                              <CalendarClock className="h-4 w-4" />
                              Reschedule
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Symptoms */}
                    {appointment.symptoms && !isCancelled && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                        </p>
                      </div>
                    )}

                    {/* Cancelled Badge */}
                    {isCancelled && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <CalendarX className="h-4 w-4" />
                          This appointment has been cancelled
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Cancel Modal */}
      <CancelModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmCancel}
        doctorName={cancelModal.doctorName}
        appointmentDate={cancelModal.date}
        appointmentTime={cancelModal.time}
        loading={cancelModal.loading}
      />
    </>
  );
}