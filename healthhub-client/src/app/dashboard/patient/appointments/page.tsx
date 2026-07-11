'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Calendar, Clock, MapPin, CheckCircle, XCircle, Clock as ClockIcon,
  CalendarX, Eye, X, User, Mail, Phone, Stethoscope, DollarSign,
  FileText, CalendarDays
} from 'lucide-react';
import { CancelModal } from '@/components/CancelModal';
import toast from 'react-hot-toast';

const AppointmentDetailsModal = ({
  isOpen,
  onClose,
  appointment
}: {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
}) => {
  if (!isOpen || !appointment) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Appointment Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Appointment #{appointment._id?.slice(-8) || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
            {getStatusBadge(appointment.status)}
          </div>

          {/* Doctor Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Doctor Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {appointment.doctor?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Specialization</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {appointment.doctor?.specialization || 'General Medicine'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {appointment.doctor?.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {appointment.doctor?.phone || 'N/A'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {appointment.doctor?.address || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(appointment.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {appointment.time}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Symptoms</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {appointment.symptoms || 'No symptoms reported'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {appointment.notes || 'No additional notes'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ${appointment.amount || appointment.consultationFee || 100}
                </p>
              </div>

            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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

  // ✅ Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

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

  // ✅ Handle View Details
  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
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
    <>
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
                  className={`bg-white rounded-xl shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${isCancelled ? 'border-red-400 opacity-75' :
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
                      <div className="flex items-center gap-2">
                        {getStatusBadge(apt.status)}
                        <button
                          onClick={() => handleViewDetails(apt)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Cancel Button */}
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
      <AppointmentDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        appointment={selectedAppointment}
      />
    </>
  );
}