'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Calendar, Clock, User, CheckCircle, XCircle, Clock as ClockIcon, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';
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

export default function DoctorSchedulePage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    loadSchedule();
  }, [selectedDate]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.getMyAppointments();
      const allAppointments = response.data || [];
      
      // Filter appointments for selected date
      const dateStr = selectedDate.toISOString().split('T')[0];
      const dayAppointments = allAppointments.filter((apt: any) => 
        apt.date && apt.date.split('T')[0] === dateStr
      );
      
      // Sort by time
      const sorted = dayAppointments.sort((a: any, b: any) => 
        a.time.localeCompare(b.time)
      );
      
      setAppointments(sorted);
      
      // Calculate stats for selected day
      setStats({
        total: sorted.length,
        pending: sorted.filter((a: any) => a.status === 'pending').length,
        confirmed: sorted.filter((a: any) => a.status === 'confirmed').length,
        completed: sorted.filter((a: any) => a.status === 'completed').length,
        cancelled: sorted.filter((a: any) => a.status === 'cancelled').length,
      });
      
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast.error('Failed to load schedule');
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

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Schedule</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your daily appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/doctor/appointments">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Appointments
            </button>
          </Link>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => changeDate(1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-lg font-semibold text-gray-800 dark:text-white ml-2">
              {formatDate(selectedDate)}
            </span>
            {isToday(selectedDate) && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Today
              </span>
            )}
          </div>
          {!isToday(selectedDate) && (
            <button
              onClick={goToToday}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              Go to Today
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.confirmed}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Confirmed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.completed}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
          Appointments for {formatDate(selectedDate)}
        </h3>
        
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No appointments scheduled</p>
            <p className="text-sm">You have no appointments on this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt, index) => (
              <div 
                key={apt._id} 
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  index % 2 === 0 
                    ? 'bg-gray-50 dark:bg-gray-700/50' 
                    : 'bg-white dark:bg-gray-800'
                } hover:shadow-md border border-transparent hover:border-gray-200 dark:hover:border-gray-600`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{apt.time}</p>
                  </div>
                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm flex-shrink-0">
                        {apt.patient?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {apt.patient?.name || 'Patient'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {apt.symptoms || 'No symptoms'}
                        </p>
                        {apt.notes && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            📝 {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(apt.status)}
                  <div className="flex gap-2">
                    {apt.status === 'pending' && (
                      <>
                        <button 
                          onClick={async () => {
                            try {
                              await api.updateAppointmentStatus(apt._id, 'confirmed');
                              toast.success('Appointment confirmed');
                              loadSchedule();
                            } catch (error) {
                              toast.error('Failed to confirm');
                            }
                          }}
                          className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              await api.updateAppointmentStatus(apt._id, 'cancelled');
                              toast.success('Appointment cancelled');
                              loadSchedule();
                            } catch (error) {
                              toast.error('Failed to cancel');
                            }
                          }}
                          className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                      <>
                        <button 
                          onClick={async () => {
                            try {
                              await api.updateAppointmentStatus(apt._id, 'completed');
                              toast.success('Appointment completed');
                              loadSchedule();
                            } catch (error) {
                              toast.error('Failed to complete');
                            }
                          }}
                          className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Complete
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              await api.updateAppointmentStatus(apt._id, 'cancelled');
                              toast.success('Appointment cancelled');
                              loadSchedule();
                            } catch (error) {
                              toast.error('Failed to cancel');
                            }
                          }}
                          className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}