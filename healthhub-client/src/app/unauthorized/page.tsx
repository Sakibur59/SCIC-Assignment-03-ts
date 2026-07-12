'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50/50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-2">Unauthorized Access</p>

        {/* Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">
            You do not have permission to access this page.
          </p>
          <p className="text-red-400 text-xs mt-1">
            This area is restricted to authorized personnel only.
          </p>
        </div>

        {/* Role Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Your Role:</span> 
            <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs font-medium">
              {typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'Guest' : 'Guest'}
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Required Role: Admin, Doctor, or Patient (as applicable)
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </button>
        </div>

        {/* Support */}
        <p className="text-xs text-gray-400 mt-6">
          If you think this is a mistake, please contact your administrator.
        </p>
      </div>
    </div>
  );
}