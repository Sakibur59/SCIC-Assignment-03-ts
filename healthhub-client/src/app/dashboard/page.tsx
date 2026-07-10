'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Calendar, FileText, User, Stethoscope, Clock, Users, Heart, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get appointments
      const appointmentsRes = await api.getMyAppointments();
      const appointments = appointmentsRes.data || [];
      
      // Get doctors
      const doctorsRes = await api.getDoctors();
      const doctors = doctorsRes.data || [];
      
      setStats({
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter((a: any) => a.status === 'pending').length,
        totalDoctors: doctors.length,
        totalPatients: 0, // Will implement later
      });
      
      // Recent activity (last 3 appointments)
      const recent = appointments.slice(0, 3).map((apt: any) => ({
        id: apt._id,
        message: `Appointment ${apt.status} with ${apt.doctor?.name || 'Doctor'}`,
        time: new Date(apt.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: apt.status,
      }));
      setRecentActivity(recent);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const role = user?.role;
    
    if (role === 'patient') {
      return [
        { label: 'Appointments', value: stats.totalAppointments, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100' },
        { label: 'Pending', value: stats.pendingAppointments, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
        { label: 'Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'text-green-500', bg: 'bg-green-100' },
        { label: 'Health Score', value: '92%', icon: Heart, color: 'text-red-500', bg: 'bg-red-100' },
      ];
    }
    
    if (role === 'doctor') {
      return [
        { label: 'Patients', value: '45', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
        { label: 'Appointments', value: stats.totalAppointments, icon: Calendar, color: 'text-green-500', bg: 'bg-green-100' },
        { label: 'Pending', value: stats.pendingAppointments, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
        { label: 'Rating', value: '4.8⭐', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-100' },
      ];
    }
    
    return [
      { label: 'Users', value: '150', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
      { label: 'Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'text-green-500', bg: 'bg-green-100' },
      { label: 'Appointments', value: stats.totalAppointments, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-100' },
      { label: 'Revenue', value: '$12,450', icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    ];
  };

  const currentStats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your health journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {currentStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {user?.role === 'patient' && (
              <>
                <Link href="/appointment?doctor=">
                  <button className="w-full text-left px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    📅 Book New Appointment
                  </button>
                </Link>
                <Link href="/my-doctors">
                  <button className="w-full text-left px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    🏥 View My Doctors
                  </button>
                </Link>
              </>
            )}
            {user?.role === 'doctor' && (
              <>
                <Link href="/doctor/schedule">
                  <button className="w-full text-left px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    📋 View Today's Schedule
                  </button>
                </Link>
                <Link href="/doctor/patients">
                  <button className="w-full text-left px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    👨‍⚕️ Manage Patients
                  </button>
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <Link href="/admin/users">
                  <button className="w-full text-left px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    👥 Manage Users
                  </button>
                </Link>
                <Link href="/admin/doctors">
                  <button className="w-full text-left px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    🏥 Manage Doctors
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'pending' ? 'bg-yellow-500' :
                    activity.status === 'confirmed' ? 'bg-green-500' :
                    activity.status === 'cancelled' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="text-sm text-gray-700">{activity.message}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}