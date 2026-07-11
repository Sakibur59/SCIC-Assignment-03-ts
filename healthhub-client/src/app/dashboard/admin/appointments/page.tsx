'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
    Calendar, Search, Filter, User, Stethoscope,
    Clock, CheckCircle, XCircle, Clock as ClockIcon,
    Eye, X, Mail, Phone, MapPin,
    CalendarDays, FileText, DollarSign
} from 'lucide-react';
import Link from 'next/link';
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

                    {/* Patient Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Patient Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                    {appointment.patient?.name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {appointment.patient?.email || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {appointment.patient?.phone || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {appointment.patient?.address || 'N/A'}
                                </p>
                            </div>
                        </div>
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
                                    {appointment.amount || appointment.consultationFee || 100}
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

export default function AdminAppointmentsPage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');


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


    const handleViewDetails = (appointment: any) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">All Appointments</h1>
                        <p className="text-gray-500 dark:text-gray-400">View and manage all appointments</p>
                        <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">{stats.total} total appointments</p>
                    </div>
                </div>

                {/* Stats */}
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

                {/* Search & Filter */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by patient or doctor name..."
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
                            <div
                                key={apt._id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg">
                                            {apt.patient?.name?.charAt(0) || 'P'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-white">
                                                {apt.patient?.name || 'Patient'}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                with {apt.doctor?.name || 'Doctor'} ({apt.doctor?.specialization || 'General Medicine'})
                                            </p>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(apt.date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {apt.time}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                <span className="font-medium">Symptoms:</span> {apt.symptoms}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(apt.status)}
                                        <button
                                            onClick={() => handleViewDetails(apt)}
                                            className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AppointmentDetailsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                appointment={selectedAppointment}
            />
        </>
    );
}