'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appointmentDate?: string;
  appointmentTime?: string;
  doctorName?: string;
  loading?: boolean;
}

export const CancelModal = ({
  isOpen,
  onClose,
  onConfirm,
  appointmentDate,
  appointmentTime,
  doctorName,
  loading = false,
}: CancelModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
          Cancel Appointment
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-center text-sm mb-4">
          Are you sure you want to cancel this appointment?
        </p>

        {/* Appointment Details */}
        {(doctorName || appointmentDate || appointmentTime) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            {doctorName && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Doctor:</span> {doctorName}
              </p>
            )}
            {appointmentDate && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Date:</span> {appointmentDate}
              </p>
            )}
            {appointmentTime && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Time:</span> {appointmentTime}
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mb-6">
          This action cannot be undone
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={loading}
          >
            Keep Appointment
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Cancelling...
              </>
            ) : (
              'Yes, Cancel'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};