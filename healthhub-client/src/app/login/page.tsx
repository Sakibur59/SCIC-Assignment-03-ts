'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card, CardBody, CardHeader } from '@nextui-org/react';
import { Eye, EyeOff, Heart } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

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
      router.push('/');
    } catch (error) {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center gap-2 pb-0">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary-500" fill="#0088ff" />
              <span className="text-2xl font-bold">HealthHub</span>
            </div>
            <h1 className="text-2xl font-semibold mt-4">Welcome Back</h1>
            <p className="text-gray-500 text-sm">Sign in to your account</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                type={isVisible ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                endContent={
                  <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className="focus:outline-none"
                  >
                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
              >
                Sign In
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary-500 hover:underline">
                  Sign Up
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}