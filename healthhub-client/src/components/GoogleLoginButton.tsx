// src/components/GoogleLoginButton.tsx

'use client';

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface GoogleLoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: any) => void;
    role?: 'patient' | 'doctor' | 'admin';
}

export const GoogleLoginButton = ({ onSuccess, onError, role = 'patient' }: GoogleLoginButtonProps) => {
    const router = useRouter();
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                console.log('🔑 Google token response:', tokenResponse);

                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                });

                const userInfo = await userInfoResponse.json();

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        credential: tokenResponse.access_token,
                        userInfo: userInfo,
                        role: role,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    // ✅ Save token and user
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('userRole', data.data.user.role);
                    document.cookie = `token=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;

                    // ✅ Update user in context
                    setUser(data.data.user);

                    toast.success('Login successful!');

                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.push('/dashboard');
                    }
                } else {
                    toast.error(data.message || 'Google login failed');
                    if (onError) onError(data);
                }
            } catch (error: any) {
                console.error('❌ Google login error:', error);
                toast.error(error.message || 'Google login failed');
                if (onError) onError(error);
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error('❌ Google OAuth error:', error);

            // ✅ Fix: Type guard to check error properties safely
            const errorMessage = (error as any)?.error || '';
            
            if (errorMessage === 'invalid_client') {
                toast.error('Google Client ID is not configured properly');
            } else if (errorMessage === 'popup_closed_by_user') {
                toast.error('Login cancelled');
            } else if (errorMessage === 'access_denied') {
                toast.error('Access denied');
            } else if (errorMessage === 'origin_mismatch') {
                toast.error('Invalid origin. Please check your Google Console settings.');
            } else {
                toast.error('Google login failed');
            }

            if (onError) onError(error);
            setLoading(false);
        },
    });

    return (
        <button
            onClick={() => handleGoogleLogin()}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            ) : (
                <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                        {loading ? 'Connecting...' : 'Continue with Google'}
                    </span>
                </>
            )}
        </button>
    );
};