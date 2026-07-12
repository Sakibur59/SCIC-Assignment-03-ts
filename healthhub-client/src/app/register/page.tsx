'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Heart, ArrowRight, User, Mail, Lock, Calendar, Stethoscope, DollarSign, Clock, Plus, X, Camera, Upload } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import Image from 'next/image';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [availability, setAvailability] = useState<{ day: string; slots: string[] }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    dateOfBirth: '',
    specialization: '',
    experience: '',
    education: '',
    consultationFee: '',
  });


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;


    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }


    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePicture(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProfilePicture('');
    setProfileFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const addDayAvailability = () => {
    const addedDays = availability.map(a => a.day);
    const availableDay = DAYS.find(day => !addedDays.includes(day));

    if (availableDay) {
      setAvailability([...availability, { day: availableDay, slots: ['09:00', '10:00'] }]);
    } else {
      toast.error('All days already added');
    }
  };

  const removeDay = (day: string) => {
    setAvailability(availability.filter(a => a.day !== day));
  };

  const addSlot = (day: string) => {
    setAvailability(availability.map(a => {
      if (a.day === day) {
        return { ...a, slots: [...a.slots, ''] };
      }
      return a;
    }));
  };

  const removeSlot = (day: string, slotIndex: number) => {
    setAvailability(availability.map(a => {
      if (a.day === day) {
        const slots = a.slots.filter((_, i) => i !== slotIndex);
        return { ...a, slots };
      }
      return a;
    }));
  };

  const updateSlot = (day: string, slotIndex: number, value: string) => {
    setAvailability(availability.map(a => {
      if (a.day === day) {
        const slots = a.slots.map((s, i) => i === slotIndex ? value : s);
        return { ...a, slots };
      }
      return a;
    }));
  };

  const toggleDay = (day: string) => {
    const exists = availability.find(a => a.day === day);
    if (exists) {
      setAvailability(availability.filter(a => a.day !== day));
    } else {
      setAvailability([...availability, { day, slots: ['09:00', '10:00'] }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        profilePicture: profilePicture || '', // ✅ Add profile picture
      };

      if (formData.role === 'patient') {
        data.dateOfBirth = formData.dateOfBirth;
      } else if (formData.role === 'doctor') {
        const cleanAvailability = availability
          .map(a => ({
            ...a,
            slots: a.slots.filter((s: string) => s.trim() !== '')
          }))
          .filter(a => a.slots.length > 0);

        data.specialization = formData.specialization;
        data.experience = parseInt(formData.experience) || 0;
        data.education = formData.education ? [formData.education] : ['MBBS'];
        data.consultationFee = parseInt(formData.consultationFee) || 500;
        data.availability = cleanAvailability;
      }

      await register(data);
      router.push('/dashboard');
    } catch (error) {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/50 p-4 py-8">
        <div className="grid lg:grid-cols-2 max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left Side - Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center max-h-[calc(100vh-100px)] overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-gray-800">HealthHub</span>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
              <p className="text-gray-500 mt-2">Join our healthcare community today</p>
            </div>

            {/* ✅ Google Sign-Up Button */}
            <div className="mb-6">
              <GoogleLoginButton 
                onSuccess={handleGoogleSuccess} 
                role={formData.role || 'patient'}
              />
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or register with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ Profile Picture Upload */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {/* Profile Picture Preview */}
                  <div 
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-white shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profilePicture ? (
                      <img 
                        src={profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-white" />
                    )}
                  </div>
                  
                  {/* Camera Icon Overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full border-2 border-white hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </button>

                  {/* Remove Image Button */}
                  {profilePicture && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 bg-red-500 p-1 rounded-full border-2 border-white hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Click to upload profile picture (Max 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={isVisible ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, role: 'patient' });
                      setAvailability([]);
                    }}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${formData.role === 'patient'
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-gray-400 text-gray-600'
                      }`}
                  >
                    🏥 Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, role: 'doctor' });
                      if (availability.length === 0) {
                        setAvailability([{ day: 'Monday', slots: ['09:00', '10:00'] }]);
                      }
                    }}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${formData.role === 'doctor'
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-gray-400 text-gray-600'
                      }`}
                  >
                    👨‍⚕️ Doctor
                  </button>
                </div>
              </div>

              {formData.role === 'patient' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required={formData.role === 'patient'}
                    />
                  </div>
                </div>
              )}

              {formData.role === 'doctor' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Specialization
                      </label>
                      <div className="relative">
                        <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="e.g., Cardiology"
                          value={formData.specialization}
                          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 5"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Education
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., MBBS, MD"
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Consultation Fee (BDT)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          placeholder="e.g., 500"
                          value={formData.consultationFee}
                          onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Availability Section */}
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Weekly Availability
                      </label>
                      <button
                        type="button"
                        onClick={addDayAvailability}
                        className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Day
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {DAYS.map((day) => {
                        const isAdded = availability.some(a => a.day === day);
                        return (
                          <button
                            type="button"
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${isAdded
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>

                    {availability.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">
                        No availability set. Click on a day above to add.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {availability.map((dayData) => (
                          <div key={dayData.day} className="bg-white rounded-lg p-2 border border-gray-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-gray-700">{dayData.day}</span>
                              <button
                                type="button"
                                onClick={() => removeDay(dayData.day)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {dayData.slots.map((slot, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <input
                                    type="time"
                                    value={slot}
                                    onChange={(e) => updateSlot(dayData.day, index, e.target.value)}
                                    className="px-2 py-0.5 border border-gray-200 rounded text-xs w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeSlot(dayData.day, index)}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addSlot(dayData.day)}
                                className="px-2 py-0.5 border border-dashed border-gray-300 rounded text-xs text-gray-400 hover:text-blue-500 hover:border-blue-500"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Creating Account...
                  </div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="text-center text-gray-600 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-500 font-semibold hover:text-blue-600 hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </div>

          {/* Right Side - Image/Banner */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-blue-500 to-blue-600 p-12 flex-col justify-center items-center text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-2xl" />
              <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 text-center">
              <div className="mb-8">
                <Heart className="h-20 w-20 text-white/80 mx-auto" fill="white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Start Your Health Journey</h2>
              <p className="text-white/80 text-lg leading-relaxed">
                Join thousands of satisfied patients. Get access to world-class healthcare services, top doctors, and personalized care.
              </p>
              <div className="mt-8 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-white/70 text-sm">Happy Patients</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-white/70 text-sm">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}