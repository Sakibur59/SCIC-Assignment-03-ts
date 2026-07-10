'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  User,
  Stethoscope,
  Settings,
  Users,
  Clock,
  BarChart3,
  UserCog,
  Heart,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PlusCircle
} from 'lucide-react';

interface MenuItem {
  label: string;
  icon: any;
  href: string;
  color: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // ✅ Role-based menu items (Dashboard এর ভিতরে)
  const getMenuItems = (): MenuItem[] => {
    const role = user?.role;
    const items: MenuItem[] = [];

    // Dashboard Home
    items.push({
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      color: 'text-blue-500',
    });

    if (role === 'patient') {
      items.push(
        {
          label: 'My Appointments',
          icon: Calendar,
          href: '/dashboard/patient/appointments',
          color: 'text-green-500',
        },
        {
          label: 'Book Appointment',
          icon: PlusCircle,
          href: '/dashboard/patient/book-appointment',
          color: 'text-blue-500',
        },
        {
          label: 'Medical Records',
          icon: FileText,
          href: '/dashboard/patient/records',
          color: 'text-purple-500',
        },
        {
          label: 'My Doctors',
          icon: Stethoscope,
          href: '/dashboard/patient/my-doctors',
          color: 'text-pink-500',
        },
        {
          label: 'Settings',
          icon: Settings,
          href: '/dashboard/patient/settings',
          color: 'text-gray-500',
        }
      );
    }

    if (role === 'doctor') {
      items.push(
        {
          label: 'My Schedule',
          icon: Clock,
          href: '/dashboard/doctor/schedule',
          color: 'text-blue-500',
        },
        {
          label: 'Appointments',
          icon: Calendar,
          href: '/dashboard/doctor/appointments',
          color: 'text-green-500',
        },
        {
          label: 'My Patients',
          icon: Users,
          href: '/dashboard/doctor/patients',
          color: 'text-purple-500',
        },
        {
          label: 'Earnings',
          icon: BarChart3,
          href: '/dashboard/doctor/earnings',
          color: 'text-emerald-500',
        },
        {
          label: 'Settings',
          icon: Settings,
          href: '/dashboard/doctor/settings',
          color: 'text-gray-500',
        }
      );
    }

    if (role === 'admin') {
      items.push(
        {
          label: 'Admin Dashboard',
          icon: BarChart3,
          href: '/dashboard/admin/dashboard',
          color: 'text-red-500',
        },
        {
          label: 'User Management',
          icon: Users,
          href: '/dashboard/admin/users',
          color: 'text-blue-500',
        },
        {
          label: 'Doctor Management',
          icon: Stethoscope,
          href: '/dashboard/admin/doctors',
          color: 'text-green-500',
        },
        {
          label: 'Appointments',
          icon: Calendar,
          href: '/dashboard/admin/appointments',
          color: 'text-purple-500',
        },
        {
          label: 'Settings',
          icon: UserCog,
          href: '/dashboard/admin/settings',
          color: 'text-gray-500',
        }
      );
    }

    return items;
  };

  const menuItems = getMenuItems();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            {isSidebarOpen ? (
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-blue-500" fill="blue" />
                <span className="font-bold text-gray-800">Dashboard</span>
              </div>
            ) : (
              <Heart className="h-6 w-6 text-blue-500 mx-auto" fill="blue" />
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isSidebarOpen ? (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              ) : (
                <Menu className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          <div className={`p-4 border-b border-gray-100 ${!isSidebarOpen && 'text-center'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${
                    user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user?.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    } ${!isSidebarOpen && 'justify-center'}`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive(item.href) ? item.color : 'text-gray-400'}`} />
                    {isSidebarOpen && (
                      <span className={`text-sm font-medium ${isActive(item.href) ? 'text-blue-600' : ''}`}>
                        {item.label}
                      </span>
                    )}
                    {isActive(item.href) && isSidebarOpen && (
                      <div className="ml-auto w-1.5 h-8 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-all ${
                !isSidebarOpen && 'justify-center'
              }`}
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transition-transform duration-300 md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-blue-500" fill="blue" />
              <span className="font-bold text-gray-800">Dashboard</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${
                  user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                  user?.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <nav className="p-3 overflow-y-auto h-[calc(100%-180px)]">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive(item.href) ? item.color : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  );
}