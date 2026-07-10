'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock } from 'lucide-react';

const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiologist',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 128,
    experience: 15,
    location: 'New York, USA',
    fee: 150,
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialization: 'Neurologist',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 96,
    experience: 12,
    location: 'Los Angeles, USA',
    fee: 180,
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    specialization: 'Pediatrician',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 156,
    experience: 10,
    location: 'Chicago, USA',
    fee: 120,
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialization: 'Orthopedic',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 84,
    experience: 18,
    location: 'Houston, USA',
    fee: 200,
  },
];

export const TopDoctors = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Top <span className="text-primary-500">Doctors</span>
            </h2>
            <p className="text-gray-600">Highly rated and experienced specialists</p>
          </div>
          <Link href="/doctors">
            <button className="text-primary-500 font-semibold hover:text-primary-600">
              View All →
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
            >
              <div className="relative">
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  width={400}
                  height={400}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{doctor.rating}</span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-gray-800 text-lg">{doctor.name}</h3>
                <p className="text-primary-500 text-sm font-medium">{doctor.specialization}</p>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{doctor.location}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Consultation Fee</span>
                    <p className="font-bold text-gray-800">${doctor.fee}</p>
                  </div>
                  <Link href={`/appointment?doctor=${doctor.id}`}>
                    <button className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors">
                      Book Now
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};