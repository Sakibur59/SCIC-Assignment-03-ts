'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Patient',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    rating: 5,
    text: 'HealthHub made it so easy to find a specialist. The booking process was seamless and I received excellent care. Highly recommend!',
    date: 'January 2024',
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Patient',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    rating: 5,
    text: 'The best healthcare platform I have ever used. The doctors are highly professional and the support team is always helpful.',
    date: 'December 2023',
  },
  {
    id: 3,
    name: 'Robert Wilson',
    role: 'Patient',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    rating: 4,
    text: 'Amazing experience with HealthHub. I could easily track my health records and book appointments with top doctors in my area.',
    date: 'November 2023',
  },
  {
    id: 4,
    name: 'Emily Davis',
    role: 'Patient',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop',
    rating: 5,
    text: 'HealthHub transformed my healthcare journey. The platform is intuitive, and the doctors are truly world-class. Highly recommended!',
    date: 'October 2023',
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 2;

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentTestimonials = testimonials.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What Our <span className="text-primary-500">Patients Say</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real stories from people who trusted us with their health
          </p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatePresence mode="wait">
              {currentTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover h-16 w-16"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-1">
                        <Quote className="h-3 w-3 text-white" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                        "{testimonial.text}"
                      </p>

                      <p className="mt-2 text-xs text-gray-400">{testimonial.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === currentIndex ? 'bg-primary-500 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 bg-white px-8 py-4 rounded-full shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-primary-600 text-xs font-semibold"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">1,200+ Trusted Patients</span>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-primary-500">4.8</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-500">(2,341 reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};