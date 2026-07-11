'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Stethoscope, Search, User, Mail, Phone, MapPin, 
  Calendar, Clock, Star, Edit2, Trash2, Plus,
  CheckCircle, XCircle, AlertCircle, X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  rating: number;
  availability: any[];
  createdAt: string;
  status: 'active' | 'inactive';
  roleData?: {
    specialization: string;
    experience: number;
    consultationFee: number;
    rating: number;
  };
}

const DeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  doctorName, 
  loading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  doctorName: string;
  loading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Remove Doctor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to remove <span className="font-semibold text-gray-800 dark:text-white">{doctorName}</span>?
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            This action cannot be undone. All associated data will be removed.
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Remove Doctor
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminDoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');


  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    doctorId: '',
    doctorName: '',
    loading: false,
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.getDoctors();
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    'All',
    ...new Set(doctors.map(d => d.roleData?.specialization).filter(Boolean))
  ];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.roleData?.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === 'All' || doc.roleData?.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });


  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      doctorId: id,
      doctorName: name,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
    
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctors/${deleteModal.doctorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete doctor');
      }

      toast.success('Doctor removed successfully');
      setDeleteModal(prev => ({ ...prev, isOpen: false, loading: false }));
      loadDoctors(); // Reload list
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove doctor');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Doctor Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage all doctors in the system</p>
            <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">{doctors.length} total doctors</p>
          </div>
          
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Doctors</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{doctors.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{doctors.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Specializations</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{specializations.length - 1}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {(doctors.reduce((sum, d) => sum + (d.roleData?.rating || 0), 0) / (doctors.length || 1)).toFixed(1)}⭐
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors List */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
            <Stethoscope className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">No doctors found</h3>
            <p className="text-gray-400 dark:text-gray-500 mt-2">No doctors match your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {doc.name?.charAt(0) || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-white truncate">{doc.name}</h3>
                    <p className="text-sm text-blue-500 dark:text-blue-400">{doc.roleData?.specialization}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{doc.roleData?.rating || 0}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{doc.roleData?.experience || 0} yrs</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <p className="flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3" /> {doc.email}
                  </p>
                  <p className="flex items-center gap-1 truncate">
                    <Phone className="h-3 w-3" /> {doc.phone || 'N/A'}
                  </p>
                  <p className="flex items-center gap-1 text-xs">
                    <span className="font-medium">Fee:</span> ${doc.roleData?.consultationFee || 0}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={() => handleDeleteClick(doc._id, doc.name)}
                    className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

   
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        doctorName={deleteModal.doctorName}
        loading={deleteModal.loading}
      />
    </>
  );
}