'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { Doctor } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Search, Star, MapPin, Clock, Calendar, Filter, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('All');
    const [sortBy, setSortBy] = useState('rating');
    const [showFilters, setShowFilters] = useState(false);

    // Get unique specializations
    const specializations = [
        'All',
        ...new Set(doctors.map(doc => doc.roleData?.specialization).filter(Boolean))
    ] as string[];

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

    // Filter and Sort doctors
    const getFilteredAndSortedDoctors = () => {
        let filtered = [...doctors];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter((doc) =>
                doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.roleData?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Specialization filter
        if (selectedSpecialization !== 'All') {
            filtered = filtered.filter((doc) =>
                doc.roleData?.specialization === selectedSpecialization
            );
        }

        // Sort
        if (sortBy === 'rating') {
            filtered.sort((a, b) => (b.roleData?.rating || 0) - (a.roleData?.rating || 0));
        } else if (sortBy === 'experience') {
            filtered.sort((a, b) => (b.roleData?.experience || 0) - (a.roleData?.experience || 0));
        } else if (sortBy === 'fee') {
            filtered.sort((a, b) => (a.roleData?.consultationFee || 0) - (b.roleData?.consultationFee || 0));
        }

        return filtered;
    };

    const filteredDoctors = getFilteredAndSortedDoctors();

    // Book Now handler
    const handleBookNow = (doctorId: string) => {
        if (!isAuthenticated) {
            toast.error('Please login to book an appointment');
            router.push('/login');
            return;
        }

        if (user?.role !== 'patient') {
            toast.error('Only patients can book appointments');
            return;
        }

        router.push(`/dashboard/patient/book-appointment?doctor=${doctorId}`);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSpecialization('All');
        setSortBy('rating');
    };

    const hasActiveFilters = searchTerm || selectedSpecialization !== 'All' || sortBy !== 'rating';

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
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-bold">Our Doctors</h1>
                        <p className="text-blue-100 mt-2">Find and book appointments with our expert doctors</p>
                        <p className="text-blue-200 text-sm mt-1">
                            {doctors.length} doctors available
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Search and Filter Bar */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-8 border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by doctor name or specialization..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Filter Toggle Button (Mobile) */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="h-5 w-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Filters</span>
                                {hasActiveFilters && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                            </button>

                            {/* Desktop Filters */}
                            <div className="hidden md:flex items-center gap-4">
                                {/* Specialization Filter */}
                                <div className="relative">
                                    <select
                                        value={selectedSpecialization}
                                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                                        className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                                    >
                                        {specializations.map((spec) => (
                                            <option key={spec} value={spec}>
                                                {spec}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>

                                {/* Sort By */}
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                                    >
                                        <option value="rating">Sort by Rating</option>
                                        <option value="experience">Sort by Experience</option>
                                        <option value="fee">Sort by Fee (Low to High)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>

                                {/* Clear Filters */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Mobile Filters */}
                        {showFilters && (
                            <div className="md:hidden mt-4 pt-4 border-t border-gray-100 space-y-4">
                                {/* Specialization Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specialization
                                    </label>
                                    <select
                                        value={selectedSpecialization}
                                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        {specializations.map((spec) => (
                                            <option key={spec} value={spec}>
                                                {spec}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="rating">Rating</option>
                                        <option value="experience">Experience</option>
                                        <option value="fee">Fee (Low to High)</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="w-full py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-red-200"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Active Filters Tags */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                        Search: {searchTerm}
                                        <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                {selectedSpecialization !== 'All' && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                        {selectedSpecialization}
                                        <button onClick={() => setSelectedSpecialization('All')} className="hover:text-blue-900">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                {sortBy !== 'rating' && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        Sort: {sortBy === 'experience' ? 'Experience' : 'Fee (Low-High)'}
                                        <button onClick={() => setSortBy('rating')} className="hover:text-gray-900">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results Count */}
                    <div className="mb-6 text-sm text-gray-500">
                        Showing {filteredDoctors.length} of {doctors.length} doctors
                    </div>

                    {/* Doctors Grid */}
                    {filteredDoctors.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600">No doctors found</h3>
                            <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDoctors.map((doctor) => (
                                <div
                                    key={doctor._id}
                                    className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                            {doctor.name?.charAt(0) || 'D'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 text-lg">{doctor.name}</h3>
                                            <p className="text-blue-500 text-sm font-medium">{doctor.roleData?.specialization}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-semibold">{doctor.roleData?.rating || 4.5}</span>
                                                <span className="text-gray-300">•</span>
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                <span className="text-sm text-gray-500">{doctor.roleData?.experience || 0} years</span>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500">Consultation Fee</p>
                                            <p className="font-bold text-gray-800">${doctor.roleData?.consultationFee || 100}</p>
                                        </div>
                                        <button
                                            onClick={() => handleBookNow(doctor._id!)}
                                            className="bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
                                        >
                                            <Calendar className="h-4 w-4" />
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}