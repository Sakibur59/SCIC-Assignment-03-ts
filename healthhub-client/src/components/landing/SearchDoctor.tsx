'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Star, Clock, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Doctor } from '@/types';

export const SearchDoctor = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Load all doctors on mount
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await api.getDoctors();
        setDoctors(response.data || []);
        setFilteredDoctors(response.data || []);
      } catch (error) {
        console.error('Error loading doctors:', error);
        // Fallback mock data
        setDoctors(mockDoctors);
        setFilteredDoctors(mockDoctors);
      }
    };
    loadDoctors();
  }, []);

  // Filter doctors based on search
  useEffect(() => {
    let filtered = doctors;

    if (searchTerm.trim()) {
      filtered = filtered.filter((doc) =>
        doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.roleData?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (location.trim()) {
      filtered = filtered.filter((doc) =>
        doc.address?.toLowerCase().includes(location.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
    setShowResults(!!searchTerm || !!location);
  }, [searchTerm, location, doctors]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setLocation('');
    setShowResults(false);
  };

  const handlePopularSearch = (term: string) => {
    setSearchTerm(term);
    setShowResults(true);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Find Your <span className="text-blue-500">Doctor</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Search and book appointments with top-rated doctors in your area
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location (e.g., Dhaka)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Search className="h-5 w-5" />
              Search Doctors
            </button>
          </div>

          {/* Popular Searches */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-gray-500 font-medium">Popular:</span>
            {['Cardiologist', 'Dentist', 'Orthopedic', 'Pediatrician', 'Dermatologist'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handlePopularSearch(item)}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {item}
              </button>
            ))}
            {(searchTerm || location) && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-sm px-3 py-1 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </form>

        {/* Search Results */}
        {showResults && (
          <div className="max-w-6xl mx-auto mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Found {filteredDoctors.length} doctors
              </h3>
              <span className="text-sm text-gray-500">
                {searchTerm && `Searching for "${searchTerm}"`}
                {location && ` in "${location}"`}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-500">Loading doctors...</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-600">No doctors found</h4>
                <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0">
                          {doctor.name?.charAt(0) || 'D'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{doctor.name}</h4>
                          <p className="text-blue-500 text-sm font-medium truncate">
                            {doctor.roleData?.specialization || 'General Medicine'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold ml-1">{doctor.roleData?.rating || 4.5}</span>
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{doctor.roleData?.experience || 0} years</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500">Consultation Fee</span>
                          <p className="font-bold text-gray-800">${doctor.roleData?.consultationFee || 100}</p>
                        </div>
                        <Link href={`/appointment?doctor=${doctor._id}`}>
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                            Book Now
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

// Mock data for fallback
const mockDoctors: Doctor[] = [
  {
    _id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@example.com',
    role: 'doctor',
    address: 'Dhaka',
    roleData: {
      specialization: 'Cardiologist',
      experience: 15,
      education: ['MBBS', 'MD'],
      availability: [],
      rating: 4.9,
      consultationFee: 150,
    },
  },
  {
    _id: '2',
    name: 'Dr. Michael Chen',
    email: 'michael@example.com',
    role: 'doctor',
    address: 'Chittagong',
    roleData: {
      specialization: 'Dentist',
      experience: 12,
      education: ['BDS', 'MDS'],
      availability: [],
      rating: 4.8,
      consultationFee: 120,
    },
  },
  {
    _id: '3',
    name: 'Dr. Emily Rodriguez',
    email: 'emily@example.com',
    role: 'doctor',
    address: 'Dhaka',
    roleData: {
      specialization: 'Pediatrician',
      experience: 10,
      education: ['MBBS', 'FCPS'],
      availability: [],
      rating: 4.9,
      consultationFee: 130,
    },
  },
];