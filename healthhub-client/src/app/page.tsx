import { Hero } from '@/components/landing/Hero';
import { Navbar } from '@/components/layout/Navbar';
import { SearchDoctor } from '@/components/landing/SearchDoctor';
import { PopularDepartments } from '@/components/landing/PopularDepartments';
import { TopDoctors } from '@/components/landing/TopDoctors';
import { Testimonials } from '@/components/landing/Testimonials';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <SearchDoctor />
      <PopularDepartments />
      <TopDoctors />
      <Testimonials />
    </main>
  );
}