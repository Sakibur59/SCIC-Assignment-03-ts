'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Plus, X, Save, AlertCircle, User, Mail, Phone, MapPin,
  Stethoscope, DollarSign, Edit2, Bell, Shield, Moon,
  Clock, Calendar, CheckCircle, Activity, Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface AvailabilitySlot {
  day: string;
  slots: string[];
}

export default function DoctorSettingsPage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [doctorId, setDoctorId] = useState<string>('');
  const [doctorData, setDoctorData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    experience: '',
    consultationFee: '',
    education: '',
  });

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      setLoading(true);

      if (!user?._id) {
        toast.error('User not found');
        setLoading(false);
        return;
      }

      const response = await api.getDoctorByUserId(user._id);
      const doctor = response.data;

      if (doctor) {
        setDoctorId(doctor._id || '');
        setDoctorData(doctor);
        setProfilePicture(doctor.profilePicture || '');
        setAvailability(doctor.roleData?.availability || []);

        setFormData({
          name: doctor.name || '',
          email: doctor.email || '',
          phone: doctor.phone || '',
          address: doctor.address || '',
          specialization: doctor.roleData?.specialization || '',
          experience: doctor.roleData?.experience?.toString() || '',
          consultationFee: doctor.roleData?.consultationFee?.toString() || '',
          education: doctor.roleData?.education?.join(', ') || '',
        });

        console.log('✅ Doctor profile found:', doctor);
      } else {
        toast.error('Doctor profile not found. Please contact support.');
      }
    } catch (error: any) {
      console.error('Error loading doctor data:', error);
      if (error.message === 'Doctor not found for this user') {
        toast.error('Doctor profile not found. Please contact support.');
      } else {
        toast.error(error.message || 'Failed to load doctor data');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Compress Image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // ✅ Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setProfilePicture(compressed);

      await api.updateProfilePicture(compressed);
      if (updateUser) await updateUser();
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  // Availability Handlers
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

  const handleSaveAvailability = async () => {
    try {
      setSaving(true);

      const cleanAvailability = availability.map(a => ({
        ...a,
        slots: a.slots.filter((s: string) => s.trim() !== '')
      })).filter(a => a.slots.length > 0);

      if (!doctorId) {
        toast.error('Doctor ID not found');
        setSaving(false);
        return;
      }

      await api.updateDoctor(doctorId, {
        availability: cleanAvailability
      });

      toast.success('Availability updated successfully!');
      setAvailability(cleanAvailability);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        profilePicture: profilePicture,
        specialization: formData.specialization,
        experience: parseInt(formData.experience) || 0,
        consultationFee: parseInt(formData.consultationFee) || 0,
        education: formData.education.split(',').map(s => s.trim()).filter(Boolean),
      };

      await api.updateDoctor(doctorId, updateData);
      if (updateUser) await updateUser();
      toast.success('Profile updated successfully!');
      setEditing(false);
      await loadDoctorData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Doctor Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your profile, availability and preferences</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Doctor Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex items-center gap-4">
          {/* ✅ Profile Picture with Upload */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profilePicture ? (
                <img src={profilePicture} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'D'
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full border-2 border-white hover:bg-blue-600 transition-colors"
            >
              <Camera className="h-4 w-4 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {doctorData?.roleData?.specialization || 'General Medicine'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                {doctorData?.roleData?.experience || 0} years
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                ${doctorData?.roleData?.consultationFee || 0} fee
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Profile Information</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <User className="inline h-4 w-4 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
                className={`w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
                  }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
                className={`w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
                  }`}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!editing}
                className={`w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
                  }`}
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Stethoscope className="inline h-4 w-4 mr-1" />
                Specialization
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                disabled={!editing}
                className={`w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
                  }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Clock className="inline h-4 w-4 mr-1" />
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                disabled={!editing}
                className={`w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
                  }`}
                placeholder="e.g., 10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Consultation Fee (BDT)
              </label>
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                disabled={!editing}
                className={`w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
                  }`}
                placeholder="e.g., 500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Education
              </label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                disabled={!editing}
                className={`w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
                  }`}
                placeholder="e.g., MBBS, MD, FCPS"
              />
            </div>
          </div>

          {editing && (
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Profile
                </>
              )}
            </button>
          )}
        </form>
      </div>
      {/* Availability Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Weekly Availability</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Set your available days and time slots</p>
          </div>
          <button
            onClick={addDayAvailability}
            className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Day
          </button>
        </div>

        {/* Day Toggle Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {DAYS.map((day) => {
            const isAdded = availability.some(a => a.day === day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isAdded
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Availability List */}
        {availability.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <p>No availability set. Click on a day above to add.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availability.map((dayData) => (
              <div key={dayData.day} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">{dayData.day}</h4>
                  <button
                    onClick={() => removeDay(dayData.day)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {dayData.slots.map((slot: string, index: number) => (
                    <div key={index} className="flex items-center gap-1">
                      <input
                        type="time"
                        value={slot}
                        onChange={(e) => updateSlot(dayData.day, index, e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      />
                      <button
                        onClick={() => removeSlot(dayData.day, index)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSlot(dayData.day)}
                    className="px-3 py-1.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Add Default Slots */}
        {availability.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Quick add default slots:</p>
            <div className="flex flex-wrap gap-2">
              {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((slot) => (
                <button
                  key={slot}
                  onClick={() => {
                    setAvailability(availability.map(a => {
                      if (a.slots.length < 6 && !a.slots.includes(slot)) {
                        return { ...a, slots: [...a.slots, slot].sort() };
                      }
                      return a;
                    }));
                  }}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save Availability */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSaveAvailability}
            disabled={saving}
            className="w-full bg-green-500 text-white py-2.5 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Availability
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview */}
      {availability.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800 mb-6">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availability.map((dayData) => (
              <div key={dayData.day} className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-blue-100 dark:border-blue-800">
                <p className="font-medium text-gray-700 dark:text-gray-300 text-xs">{dayData.day}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dayData.slots.filter((s: string) => s.trim() !== '').map((slot: string) => (
                    <span key={slot} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive appointment reminders and updates</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your data privacy settings</p>
              </div>
            </div>
            <button className="text-blue-500 text-sm hover:underline">Manage</button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}