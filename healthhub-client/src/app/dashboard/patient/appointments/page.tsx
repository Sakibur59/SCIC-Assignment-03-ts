'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Clock as ClockIcon, CalendarX } from 'lucide-react';
import { CancelModal } from '@/components/CancelModal';
import toast from 'react-hot-toast';

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState<any>({
    isOpen: false,
    appointmentId: null,
    doctorName: '',
    date: '',
    time: '',
    loading: false,
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.getMyAppointments();
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
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

  const handleCancel = (appointment: any) => {
    setCancelModal({
      isOpen: true,
      appointmentId: appointment._id,
      doctorName: appointment.doctor?.name || 'Doctor',
      date: new Date(appointment.date).toLocaleDateString(),
      time: appointment.time,
      loading: false,
    });
  };

  const handleConfirmCancel = async () => {
    try {
      setCancelModal((prev: any) => ({ ...prev, loading: true }));
      await api.cancelAppointment(cancelModal.appointmentId);
      toast.success('Appointment cancelled successfully');
      setCancelModal((prev: any) => ({ ...prev, isOpen: false }));
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel');
      setCancelModal((prev: any) => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Appointments</h1>
      <p className="text-gray-500 mb-6">View and manage all your appointments</p>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No appointments found</h3>
          <p className="text-gray-400 mt-2">You haven't booked any appointments yet.</p>
          <button
            onClick={() => router.push('/dashboard/patient/book-appointment')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Book an Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const isCancelled = apt.status === 'cancelled';
            const isCompleted = apt.status === 'completed';
            const canCancel = apt.status === 'pending' || apt.status === 'confirmed';

            return (
              <div
                key={apt._id}
                className={`bg-white rounded-xl shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${
                  isCancelled ? 'border-red-400 opacity-75' :
                  isCompleted ? 'border-blue-400' :
                  apt.status === 'pending' ? 'border-yellow-400' :
                  'border-green-400'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left - Doctor Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {apt.doctor?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {apt.doctor?.name || 'Doctor'}
                      </h3>
                      <p className="text-sm text-blue-500 font-medium">
                        {apt.doctor?.specialization || 'General Medicine'}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(apt.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {apt.time}
                        </span>
                      </div>
                      {apt.doctor?.address && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {apt.doctor.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right - Status & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(apt.status)}
                    
                    {/* ✅ শুধু Cancel Button - Reschedule বাদ */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(apt)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 border border-red-200 hover:border-red-300 shadow-sm hover:shadow"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Symptoms */}
                {apt.symptoms && !isCancelled && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Symptoms:</span> {apt.symptoms}
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

      <CancelModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal((prev: any) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmCancel}
        doctorName={cancelModal.doctorName}
        appointmentDate={cancelModal.date}
        appointmentTime={cancelModal.time}
        loading={cancelModal.loading}
      />
    </div>
  );
}