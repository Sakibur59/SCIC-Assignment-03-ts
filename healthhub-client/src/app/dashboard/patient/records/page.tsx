'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { FileText, Download, Eye, Calendar, Clock, Search, Filter, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface MedicalRecord {
  _id: string;
  title: string;
  type: string;
  date: string;
  doctorName: string;
  description: string;
  fileUrl?: string;
}

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');


  const mockRecords: MedicalRecord[] = [
    {
      _id: '1',
      title: 'Annual Physical Examination',
      type: 'Checkup',
      date: '2024-01-15',
      doctorName: 'Dr. Sarah Johnson',
      description: 'Complete physical examination with blood work and vital signs check.',
      fileUrl: '#'
    },
    {
      _id: '2',
      title: 'Blood Test Results',
      type: 'Lab Report',
      date: '2024-01-10',
      doctorName: 'Dr. Michael Chen',
      description: 'Complete blood count, lipid panel, and glucose levels.',
      fileUrl: '#'
    },
    {
      _id: '3',
      title: 'X-Ray Report',
      type: 'Imaging',
      date: '2024-01-05',
      doctorName: 'Dr. James Wilson',
      description: 'Chest X-Ray results showing normal lung fields.',
      fileUrl: '#'
    },
    {
      _id: '4',
      title: 'Prescription - Antibiotics',
      type: 'Prescription',
      date: '2024-01-03',
      doctorName: 'Dr. Emily Rodriguez',
      description: 'Amoxicillin 500mg - 7 days course for respiratory infection.',
      fileUrl: '#'
    },
    {
      _id: '5',
      title: 'Vaccination Record',
      type: 'Vaccination',
      date: '2023-12-20',
      doctorName: 'Dr. Aisha Rahman',
      description: 'COVID-19 Booster shot administered.',
      fileUrl: '#'
    }
  ];

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setRecords(mockRecords);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('Failed to load medical records');
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checkup': return 'bg-blue-100 text-blue-600';
      case 'lab report': return 'bg-purple-100 text-purple-600';
      case 'imaging': return 'bg-green-100 text-green-600';
      case 'prescription': return 'bg-yellow-100 text-yellow-600';
      case 'vaccination': return 'bg-pink-100 text-pink-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checkup': return '🏥';
      case 'lab report': return '🔬';
      case 'imaging': return '🩻';
      case 'prescription': return '💊';
      case 'vaccination': return '💉';
      default: return '📄';
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || record.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const recordTypes = ['all', ...new Set(records.map(r => r.type.toLowerCase()))];

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
          <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
          <p className="text-gray-500">View and manage your medical records</p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload Record
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search records by title, doctor, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {recordTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No records found</h3>
          <p className="text-gray-400 mt-2">No medical records match your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div
              key={record._id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${getTypeColor(record.type)} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {getTypeIcon(record.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{record.title}</h3>
                    <p className="text-sm text-gray-500">{record.doctorName}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                        {record.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}