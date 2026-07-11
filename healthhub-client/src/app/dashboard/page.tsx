'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Calendar, FileText, User, Stethoscope, Clock, Users, Heart, Activity,
  TrendingUp, DollarSign, CheckCircle, XCircle, Clock as ClockIcon,
  BarChart3, Briefcase, Hospital, Pill, Syringe, UserPlus, UserMinus
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
    todayAppointments: 0,
    earnings: 0,
    healthScore: 92,
    rating: 4.8,
    totalRevenue: 0,
    activeDoctors: 0,
    totalDepartments: 0,
    newPatientsThisMonth: 0,
    newDoctorsThisMonth: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const role = user?.role;

      // Get appointments
      const appointmentsRes = await api.getMyAppointments();
      const appointments = appointmentsRes.data || [];
      
      // Get doctors
      const doctorsRes = await api.getDoctors();
      const doctors = doctorsRes.data || [];

      // Get patients (from appointments unique patientId)
      const uniquePatients = new Set(appointments.map((a: any) => a.patientId));
      const totalPatients = uniquePatients.size;

      // Today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Filter today's appointments
      const todayApps = appointments.filter((apt: any) => 
        apt.date && apt.date.split('T')[0] === today
      );
      setTodayAppointments(todayApps);

      // Calculate stats
      const total = appointments.length;
      const pending = appointments.filter((a: any) => a.status === 'pending').length;
      const confirmed = appointments.filter((a: any) => a.status === 'confirmed').length;
      const completed = appointments.filter((a: any) => a.status === 'completed').length;
      const cancelled = appointments.filter((a: any) => a.status === 'cancelled').length;
      
      // Earnings (completed appointments)
      const earnings = appointments
        .filter((a: any) => a.status === 'completed')
        .reduce((sum: number, a: any) => sum + (a.consultationFee || 100), 0);

      // Recent activity (last 5 appointments)
      const recent = appointments.slice(0, 5).map((apt: any) => ({
        id: apt._id,
        message: role === 'doctor' 
          ? `Appointment ${apt.status} with ${apt.patient?.name || 'Patient'}`
          : `Appointment ${apt.status} with ${apt.doctor?.name || 'Doctor'}`,
        time: new Date(apt.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: apt.status,
      }));

      // Calculate new patients this month (mock - from appointments)
      const thisMonth = new Date().getMonth();
      const newPatientsThisMonth = appointments
        .filter((a: any) => new Date(a.createdAt).getMonth() === thisMonth)
        .reduce((acc: Set<string>, a: any) => acc.add(a.patientId), new Set())
        .size;

      // New doctors this month (mock)
      const newDoctorsThisMonth = doctors
        .filter((d: any) => new Date(d.createdAt).getMonth() === thisMonth)
        .length;

      setStats({
        totalAppointments: total,
        pendingAppointments: pending,
        confirmedAppointments: confirmed,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        totalDoctors: doctors.length,
        totalPatients: totalPatients,
        todayAppointments: todayApps.length,
        earnings: earnings,
        totalRevenue: earnings * 0.7,
        activeDoctors: doctors.length,
        totalDepartments: 8,
        healthScore: 92,
        rating: 4.8,
        newPatientsThisMonth: newPatientsThisMonth || 12,
        newDoctorsThisMonth: newDoctorsThisMonth || 3,
      });

      setRecentActivity(recent);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  // ============ PATIENT STATS ============
  const getPatientStats = () => {
    return [
      { label: 'Appointments', value: stats.totalAppointments, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900' },
      { label: 'Pending', value: stats.pendingAppointments, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900' },
      { label: 'Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900' },
      { label: 'Health Score', value: `${stats.healthScore}%`, icon: Heart, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900' },
    ];
  };

  // ============ DOCTOR STATS ============
  const getDoctorStats = () => {
    return [
      { label: 'Patients', value: stats.totalPatients, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900' },
      { label: 'Appointments', value: stats.totalAppointments, icon: Calendar, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900' },
      { label: 'Today\'s Schedule', value: stats.todayAppointments, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900' },
      { label: 'Earnings', value: `$${stats.earnings}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900' },
    ];
  };

  // ============ ADMIN STATS ============
  const getAdminStats = () => {
    return [
      { label: 'Total Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900' },
      { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900' },
      { label: 'Appointments', value: stats.totalAppointments, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900' },
      { label: 'Revenue', value: `$${stats.totalRevenue}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900' },
    ];
  };

  const getStats = () => {
    const role = user?.role;
    if (role === 'patient') return getPatientStats();
    if (role === 'doctor') return getDoctorStats();
    if (role === 'admin') return getAdminStats();
    return getPatientStats();
  };

  const currentStats = getStats();

  // ============ QUICK ACTIONS ============
  const getQuickActions = () => {
    const role = user?.role;
    
    if (role === 'patient') {
      return [
        { label: 'Book Appointment', icon: '📅', href: '/dashboard/patient/book-appointment', color: 'bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900' },
        { label: 'My Appointments', icon: '📋', href: '/dashboard/patient/appointments', color: 'bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-900' },
        { label: 'Medical Records', icon: '📄', href: '/dashboard/patient/records', color: 'bg-purple-50 dark:bg-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900' },
        { label: 'My Doctors', icon: '👨‍⚕️', href: '/dashboard/patient/my-doctors', color: 'bg-pink-50 dark:bg-pink-900/50 hover:bg-pink-100 dark:hover:bg-pink-900' },
      ];
    }
    
    if (role === 'doctor') {
      return [
        { label: 'My Schedule', icon: '📋', href: '/dashboard/doctor/schedule', color: 'bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900' },
        { label: 'Appointments', icon: '📅', href: '/dashboard/doctor/appointments', color: 'bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-900' },
        { label: 'My Patients', icon: '👥', href: '/dashboard/doctor/patients', color: 'bg-purple-50 dark:bg-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900' },
        { label: 'Settings', icon: '⚙️', href: '/dashboard/doctor/settings', color: 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700' },
      ];
    }
    
   if (role === 'admin') {
    return [
      { label: 'User Management', icon: '👥', href: '/dashboard/admin/users', color: 'bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-900' },
      { label: 'Appointments', icon: '📅', href: '/dashboard/admin/appointments', color: 'bg-purple-50 dark:bg-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900' },
      { label: 'Settings', icon: '⚙️', href: '/dashboard/admin/settings', color: 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700' },
    ];
  }
    
    return [];
  };

  const quickActions = getQuickActions();

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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {user?.role === 'doctor' ? 'Doctor Dashboard' : 
           user?.role === 'admin' ? 'Admin Dashboard' : 
           'Welcome back'}, {user?.name}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {user?.role === 'doctor' ? 'Manage your patients and appointments' :
           user?.role === 'admin' ? 'Monitor and manage the entire system' :
           "Here's what's happening with your health journey"}
        </p>
        {user?.role === 'doctor' && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {currentStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-2.5 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Extra Stats */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <UserPlus className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">New Patients</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">+{stats.newPatientsThisMonth}</p>
                <p className="text-xs text-green-500">This month</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
                <UserMinus className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">New Doctors</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">+{stats.newDoctorsThisMonth}</p>
                <p className="text-xs text-green-500">This month</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 dark:bg-pink-900 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active Today</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{stats.todayAppointments}</p>
                <p className="text-xs text-blue-500">Appointments</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Departments</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{stats.totalDepartments}</p>
                <p className="text-xs text-gray-400">Active</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Appointments (for Doctor) */}
      {user?.role === 'doctor' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Today's Appointments
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                ({todayAppointments.length})
              </span>
            </h3>
            <Link href="/dashboard/doctor/appointments">
              <button className="text-blue-500 text-sm hover:underline">View All</button>
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((apt: any) => (
                <div key={apt._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
                      {apt.patient?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        {apt.patient?.name || 'Patient'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{apt.time}</span>
                        <span>•</span>
                        <span className="truncate max-w-[100px]">{apt.symptoms || 'No symptoms'}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(apt.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <button className={`w-full text-left px-4 py-3 ${action.color} rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2`}>
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.status === 'pending' ? 'bg-yellow-500' :
                    activity.status === 'confirmed' ? 'bg-green-500' :
                    activity.status === 'cancelled' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{activity.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin - Appointment Status Summary */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Appointment Status</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Pending</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">{stats.pendingAppointments}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats.totalAppointments ? (stats.pendingAppointments / stats.totalAppointments) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{stats.confirmedAppointments}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.totalAppointments ? (stats.confirmedAppointments / stats.totalAppointments) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{stats.completedAppointments}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.totalAppointments ? (stats.completedAppointments / stats.totalAppointments) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{stats.cancelledAppointments}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats.totalAppointments ? (stats.cancelledAppointments / stats.totalAppointments) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Total Doctors</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{stats.totalDoctors}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Total Patients</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Registered</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{stats.totalPatients}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Total Appointments</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">All time</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}