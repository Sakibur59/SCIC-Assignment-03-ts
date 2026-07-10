'use client';

import { motion } from 'framer-motion';
import { 
  Heart, Brain, Bone, Stethoscope, Eye, Baby, Activity, Microscope 
} from 'lucide-react';

const departments = [
  {
    id: 1,
    name: 'Cardiology',
    icon: Heart,
    description: 'Heart care and cardiovascular treatments',
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 2,
    name: 'Neurology',
    icon: Brain,
    description: 'Brain and nervous system disorders',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 3,
    name: 'Orthopedics',
    icon: Bone,
    description: 'Bone and joint treatments',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 4,
    name: 'Pediatrics',
    icon: Baby,
    description: 'Child healthcare and development',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    id: 5,
    name: 'Ophthalmology',
    icon: Eye,
    description: 'Eye care and vision correction',
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 6,
    name: 'General Medicine',
    icon: Stethoscope,
    description: 'Primary healthcare services',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 7,
    name: 'Physical Therapy',
    icon: Activity,
    description: 'Rehabilitation and physical recovery',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    id: 8,
    name: 'Laboratory',
    icon: Microscope,
    description: 'Diagnostic and lab services',
    color: 'bg-orange-100 text-orange-600',
  },
];

export const PopularDepartments = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Popular <span className="text-blue-500">Departments</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Explore our specialized departments with expert doctors
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-gray-100 group"
            >
              <div className={`w-14 h-14 rounded-xl ${dept.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <dept.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-1">{dept.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{dept.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};