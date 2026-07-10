import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Heart, Users, Award, Globe, Stethoscope, Clock, Shield, Activity } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About HealthHub</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Revolutionizing healthcare through technology and compassion
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Our <span className="text-blue-500">Mission</span>
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  At HealthHub, we believe that quality healthcare should be accessible to everyone. 
                  Our mission is to bridge the gap between patients and healthcare providers through 
                  innovative technology.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We are committed to providing a seamless, secure, and user-friendly platform that 
                  empowers patients to take control of their health journey.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <Heart className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-gray-600">Happy Patients</div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl text-center">
                  <Users className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-gray-600">Expert Doctors</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl text-center">
                  <Award className="h-10 w-10 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">98%</div>
                  <div className="text-sm text-gray-600">Satisfaction Rate</div>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl text-center">
                  <Globe className="h-10 w-10 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">50+</div>
                  <div className="text-sm text-gray-600">Cities Covered</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              Our <span className="text-blue-500">Core Values</span>
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 mb-2">Compassion</h3>
                <p className="text-sm text-gray-500">Patient-centered care with empathy</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 mb-2">Trust</h3>
                <p className="text-sm text-gray-500">Secure and reliable healthcare</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Activity className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 mb-2">Innovation</h3>
                <p className="text-sm text-gray-500">Cutting-edge healthcare technology</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 mb-2">Excellence</h3>
                <p className="text-sm text-gray-500">Commitment to quality care</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Our <span className="text-blue-500">Leadership Team</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">
              Dedicated professionals working to make healthcare better for everyone
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { name: 'Dr. Sarah Johnson', role: 'CEO & Founder', icon: '👩‍⚕️' },
                { name: 'Dr. Michael Chen', role: 'Medical Director', icon: '👨‍⚕️' },
                { name: 'Emily Rodriguez', role: 'Head of Operations', icon: '👩‍💼' },
                { name: 'James Wilson', role: 'CTO', icon: '👨‍💻' },
              ].map((member, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <div className="text-5xl mb-4">{member.icon}</div>
                  <h3 className="font-semibold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}