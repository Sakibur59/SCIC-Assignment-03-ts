'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Plus, X, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface AvailabilitySlot {
  day: string;
  slots: string[];
}

export default function DoctorSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [doctorId, setDoctorId] = useState<string>('');
  const [doctorData, setDoctorData] = useState<any>(null);

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

      // ✅ Get doctor by userId
      const response = await api.getDoctorByUserId(user._id);
      const doctor = response.data;
      
      if (doctor) {
        setDoctorId(doctor._id || '');
        setDoctorData(doctor);
        setAvailability(doctor.roleData?.availability || []);
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

  const handleSave = async () => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Doctor Settings</h1>
          <p className="text-gray-500">Manage your availability and schedule</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !doctorId}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Availability
            </>
          )}
        </button>
      </div>

      {/* Doctor Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 text-lg">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-sm text-blue-500">{doctorData?.roleData?.specialization || 'General Medicine'}</p>
          </div>
        </div>
      </div>

      {/* Availability Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Weekly Availability</h3>
            <p className="text-sm text-gray-500">Set your available days and time slots</p>
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isAdded
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Availability List */}
        {availability.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <p>No availability set. Click on a day above to add.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availability.map((dayData) => (
              <div key={dayData.day} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-700">{dayData.day}</h4>
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
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
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
                    className="px-3 py-1.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-colors"
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
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Quick add default slots:</p>
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
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {availability.length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 className="font-semibold text-blue-800 text-sm mb-2">Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availability.map((dayData) => (
              <div key={dayData.day} className="bg-white rounded-lg p-2 shadow-sm">
                <p className="font-medium text-gray-700 text-xs">{dayData.day}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dayData.slots.filter((s: string) => s.trim() !== '').map((slot: string) => (
                    <span key={slot} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}