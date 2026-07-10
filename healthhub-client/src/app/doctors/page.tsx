'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { Doctor } from '@/types';
import Link from 'next/link';
import { Search, Star, MapPin, Clock } from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.roleData?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold">Our Doctors</h1>
            <p className="text-blue-100 mt-2">Find and book appointments with our expert doctors</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search */}
          <div className="bg-white rounded-xl shadow p-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor._id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                    {doctor.name?.charAt(0) || 'D'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                    <p className="text-blue-500 text-sm">{doctor.roleData?.specialization}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{doctor.roleData?.rating || 4.5}</span>
                      <span className="text-gray-400">•</span>
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-500">{doctor.roleData?.experience || 0} years</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Fee</p>
                    <p className="font-bold">${doctor.roleData?.consultationFee || 100}</p>
                  </div>
                  <Link href={`/appointment?doctor=${doctor._id}`}>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">
                      Book Now
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No doctors found</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}