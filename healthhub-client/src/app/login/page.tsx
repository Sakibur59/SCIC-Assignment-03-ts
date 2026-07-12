'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Heart, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
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
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/50 p-4">
        <div className="grid lg:grid-cols-2 max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left Side - Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-gray-800">HealthHub</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
              <p className="text-gray-500 mt-2">Sign in to continue to your account</p>
            </div>

            {/* ✅ Google Login Button */}
            <div className="mb-6">
              <GoogleLoginButton 
                onSuccess={handleGoogleSuccess} 
                role="patient"
              />
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Register Link */}
              <p className="text-center text-gray-600 text-sm mt-4">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-500 font-semibold hover:text-blue-600 hover:underline">
                  Create Account
                </Link>
              </p>
            </form>

            {/* Note */}
            <p className="text-center text-xs text-gray-400 mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
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
              <h2 className="text-3xl font-bold mb-4">Welcome to HealthHub</h2>
              <p className="text-white/80 text-lg leading-relaxed">
                Your trusted partner in healthcare. Access top doctors, manage appointments, and track your health journey.
              </p>
              <div className="mt-8 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-white/70 text-sm">Trusted Doctors</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold">4.9</div>
                  <div className="text-white/70 text-sm">Patient Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}