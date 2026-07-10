'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card, CardBody, CardHeader, Select, SelectItem } from '@nextui-org/react';
import { Eye, EyeOff, Heart } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'patient') {
        data.dateOfBirth = formData.dateOfBirth;
      } else if (formData.role === 'doctor') {
        data.specialization = formData.specialization;
        data.experience = parseInt(formData.experience) || 0;
        data.education = formData.education ? [formData.education] : ['MBBS'];
        data.consultationFee = parseInt(formData.consultationFee) || 500;
      }

      await register(data);
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
            <h1 className="text-2xl font-semibold mt-4">Create Account</h1>
            <p className="text-gray-500 text-sm">Join our healthcare community</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
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
              <Select
                label="Role"
                placeholder="Select your role"
                selectedKeys={[formData.role]}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <SelectItem key="patient" value="patient">Patient</SelectItem>
                <SelectItem key="doctor" value="doctor">Doctor</SelectItem>
              </Select>

              {formData.role === 'patient' && (
                <Input
                  type="date"
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              )}

              {formData.role === 'doctor' && (
                <>
                  <Input
                    type="text"
                    label="Specialization"
                    placeholder="e.g., Cardiology"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    label="Years of Experience"
                    placeholder="e.g., 5"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    required
                  />
                  <Input
                    type="text"
                    label="Education"
                    placeholder="e.g., MBBS, MD"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    label="Consultation Fee (BDT)"
                    placeholder="e.g., 500"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    required
                  />
                </>
              )}

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
              >
                Create Account
              </Button>
              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-500 hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}