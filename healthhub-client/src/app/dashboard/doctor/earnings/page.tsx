'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  DollarSign, TrendingUp, Calendar, Clock, 
  Users, CheckCircle, BarChart3, Download,
  Wallet, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EarningsData {
  total: number;
  monthly: number;
  weekly: number;
  today: number;
  appointments: any[];
  completedAppointments: any[];
  pendingAppointments: any[];
}

export default function DoctorEarningsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<EarningsData>({
    total: 0,
    monthly: 0,
    weekly: 0,
    today: 0,
    appointments: [],
    completedAppointments: [],
    pendingAppointments: [],
  });
  const [period, setPeriod] = useState('all'); // all, monthly, weekly

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      
      const response = await api.getMyAppointments();
      const allAppointments = response.data || [];

      // Filter completed appointments
      const completed = allAppointments.filter((a: any) => a.status === 'completed');
      const pending = allAppointments.filter((a: any) => a.status === 'pending');
      
      // Calculate fees (assuming each appointment has consultationFee)
      const totalFee = completed.reduce((sum: number, a: any) => sum + (a.consultationFee || 100), 0);
      
      // Today's earnings
      const today = new Date().toISOString().split('T')[0];
      const todayCompleted = completed.filter((a: any) => 
        a.date && a.date.split('T')[0] === today
      );
      const todayEarnings = todayCompleted.reduce((sum: number, a: any) => sum + (a.consultationFee || 100), 0);
      
      // This week's earnings
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekCompleted = completed.filter((a: any) => 
        a.date && new Date(a.date) >= weekAgo
      );
      const weekEarnings = weekCompleted.reduce((sum: number, a: any) => sum + (a.consultationFee || 100), 0);
      
      // This month's earnings
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthCompleted = completed.filter((a: any) => 
        a.date && new Date(a.date) >= monthAgo
      );
      const monthEarnings = monthCompleted.reduce((sum: number, a: any) => sum + (a.consultationFee || 100), 0);

      setEarnings({
        total: totalFee,
        monthly: monthEarnings,
        weekly: weekEarnings,
        today: todayEarnings,
        appointments: allAppointments,
        completedAppointments: completed,
        pendingAppointments: pending,
      });

    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return '$' + amount.toFixed(2);
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Earnings</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your earnings and payments</p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Total Earnings Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="h-6 w-6" />
          <span className="text-sm opacity-80">Total Earnings</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold">{formatCurrency(earnings.total)}</p>
            <p className="text-sm opacity-80 mt-1">
              From {earnings.completedAppointments.length} completed appointments
            </p>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">+12.5%</span>
          </div>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(earnings.today)}</p>
          <p className="text-xs text-green-500">+{earnings.today > 0 ? 'Active' : 'No earnings'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">This Week</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(earnings.weekly)}</p>
          <p className="text-xs text-blue-500">{Math.round(earnings.weekly / 7)} avg/day</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(earnings.monthly)}</p>
          <p className="text-xs text-purple-500">{Math.round(earnings.monthly / 30)} avg/day</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
            {earnings.pendingAppointments.length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Appointments</p>
        </div>
      </div>

      {/* Charts and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Earnings Overview</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Appointments</span>
                <span className="font-medium text-gray-800 dark:text-white">{earnings.appointments.length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="font-medium text-green-600 dark:text-green-400">{earnings.completedAppointments.length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ 
                  width: `${earnings.appointments.length > 0 ? (earnings.completedAppointments.length / earnings.appointments.length) * 100 : 0}%` 
                }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Pending</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">{earnings.pendingAppointments.length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ 
                  width: `${earnings.appointments.length > 0 ? (earnings.pendingAppointments.length / earnings.appointments.length) * 100 : 0}%` 
                }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Completed</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Appointments</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{earnings.completedAppointments.length}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Pending</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Appointments</p>
                </div>
              </div>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{earnings.pendingAppointments.length}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Avg per Appointment</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completed only</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {earnings.completedAppointments.length > 0 
                  ? formatCurrency(earnings.total / earnings.completedAppointments.length) 
                  : '$0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Completed Appointments */}
      {earnings.completedAppointments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mt-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Recent Completed Appointments</h3>
          <div className="space-y-3">
            {earnings.completedAppointments.slice(0, 5).map((apt: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
                    {apt.patient?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {apt.patient?.name || 'Patient'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(apt.date).toLocaleDateString()} at {apt.time}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  +${apt.consultationFee || 100}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}