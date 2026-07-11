'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Users, User, Search, Calendar, Clock, Stethoscope,
  Phone, Mail, MapPin, CalendarDays, Activity,
  ChevronDown, Filter, X, Eye, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalVisits: number;
  lastVisit: string;
  lastVisitDate: string;
  symptoms: string[];
  appointments: any[];
}

export default function DoctorPatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [sortBy, setSortBy] = useState('lastVisit');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);

      // Get all appointments for this doctor
      const appointmentsRes = await api.getMyAppointments();
      const allAppointments = appointmentsRes.data || [];

      // Group appointments by patient
      const patientMap = new Map<string, Patient>();

      allAppointments.forEach((apt: any) => {
        const patientId = apt.patientId;
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            id: patientId,
            name: apt.patient?.name || 'Unknown Patient',
            email: apt.patient?.email || '',
            phone: apt.patient?.phone || '',
            address: apt.patient?.address || '',
            totalVisits: 0,
            lastVisit: '',
            lastVisitDate: '',
            symptoms: [],
            appointments: [],
          });
        }

        const patient = patientMap.get(patientId)!;
        patient.totalVisits += 1;
        patient.appointments.push(apt);

        // Collect symptoms
        if (apt.symptoms) {
          patient.symptoms.push(apt.symptoms);
        }

        // Update last visit
        const aptDate = new Date(apt.date);
        if (!patient.lastVisitDate || aptDate > new Date(patient.lastVisitDate)) {
          patient.lastVisitDate = apt.date;
          patient.lastVisit = apt.date;
        }
      });

      // Convert to array and sort
      const patientArray = Array.from(patientMap.values());

      // Sort by last visit (most recent first)
      patientArray.sort((a, b) => {
        return new Date(b.lastVisitDate).getTime() - new Date(a.lastVisitDate).getTime();
      });

      setPatients(patientArray);

    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const getUniqueSymptoms = (symptoms: string[]) => {
    const unique = [...new Set(symptoms)];
    return unique.slice(0, 5);
  };

  const getRecentAppointments = (appointments: any[]) => {
    return appointments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Patients</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your patient list and history</p>
          <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">{patients.length} total patients</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/doctor/appointments">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Appointments
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Patients</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{patients.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Visits</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {patients.reduce((sum, p) => sum + p.totalVisits, 0)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Visits/Patient</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {patients.length > 0 ? (patients.reduce((sum, p) => sum + p.totalVisits, 0) / patients.length).toFixed(1) : '0'}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <User className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">New Patients</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {patients.filter(p => p.totalVisits === 1).length}
              </p>
            </div>
            <div className="bg-pink-100 dark:bg-pink-900 p-2 rounded-lg">
              <Stethoscope className="h-5 w-5 text-pink-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
          <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">No patients found</h3>
          <p className="text-gray-400 dark:text-gray-500 mt-2">You haven't treated any patients yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handlePatientClick(patient)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer hover:border-blue-200 dark:hover:border-blue-700"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {patient.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">{patient.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{patient.email}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {patient.totalVisits} visits
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {patient.phone && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patient.phone}
                    </p>
                  )}
                  {patient.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {getUniqueSymptoms(patient.symptoms).map((symptom, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          {symptom}
                        </span>
                      ))}
                      {patient.symptoms.length > 5 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full">
                          +{patient.symptoms.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Detail Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{selectedPatient.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPatient.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPatientModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{selectedPatient.phone || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Visits</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{selectedPatient.totalVisits}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Visit</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{selectedPatient.address || 'N/A'}</p>
                </div>
              </div>

              {/* Symptoms History */}
              {selectedPatient.symptoms.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Symptoms History</h4>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(selectedPatient.symptoms)].map((symptom, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full text-sm">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Appointments */}
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Recent Appointments</h4>
                <div className="space-y-2">
                  {getRecentAppointments(selectedPatient.appointments).map((apt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {new Date(apt.date).toLocaleDateString()} at {apt.time}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{apt.symptoms}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>


            </div>
          </div>
        </div>
      )}
    </div>
  );
}