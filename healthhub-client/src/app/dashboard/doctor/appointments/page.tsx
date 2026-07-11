'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Calendar, Clock, User, Search, Filter, CheckCircle, XCircle, Clock as ClockIcon, Eye } from 'lucide-react';
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
  patient?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"><ClockIcon className="h-3 w-3 mr-1" /> Pending</span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><XCircle className="h-3 w-3 mr-1" /> Cancelled</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"><CheckCircle className="h-3 w-3 mr-1" /> Completed</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status}</span>;
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    try {
      await api.updateAppointmentStatus(appointmentId, status);
      toast.success(`Appointment ${status}`);
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.symptoms?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Appointments</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your patient appointments</p>
          <p className="text-sm text-gray-400 mt-1">{appointments.length} total appointments</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
          <Calendar className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">No appointments found</h3>
          <p className="text-gray-400 dark:text-gray-500 mt-2">No appointments match your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div key={apt._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg">
                    {apt.patient?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{apt.patient?.name || 'Patient'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{apt.patient?.email || 'No email'}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {apt.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <span className="font-medium">Symptoms:</span> {apt.symptoms}
                    </p>
                    {apt.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="font-medium">Notes:</span> {apt.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(apt.status)}
                  <div className="flex gap-2">
                    {apt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                          className="px-3 py-1 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                          className="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(apt._id, 'completed')}
                          className="px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                          className="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}