'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Heart, 
  User, 
  LogOut, 
  Settings, 
  Calendar, 
  FileText, 
  Menu, 
  X,
  LayoutDashboard,
  ChevronDown,
  Users,
  PlusCircle,
  Stethoscope,
  Clock,
  BarChart3,
  UserCog
} from 'lucide-react';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Doctors', path: '/doctors' },
    { name: 'Appointment', path: '/appointment' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role display name
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'doctor':
        return 'Doctor';
      case 'patient':
        return 'Patient';
      default:
        return 'User';
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/');
  };

  // Role-based menu items (Simplified - 4/5 items each)
  const getDropdownItems = () => {
    const role = user?.role;

    // Common items for all roles
    const commonItems = [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        color: 'text-blue-500',
      },
    ];

    // Patient-specific items (5 items)
    const patientItems = [
      {
        label: 'My Appointments',
        icon: Calendar,
        href: '/appointments',
        color: 'text-green-500',
      },
      {
        label: 'Book Appointment',
        icon: PlusCircle,
        href: '/appointment',
        color: 'text-blue-500',
      },
      {
        label: 'Medical Records',
        icon: FileText,
        href: '/records',
        color: 'text-purple-500',
      },
      {
        label: 'My Doctors',
        icon: Stethoscope,
        href: '/my-doctors',
        color: 'text-pink-500',
      },
      {
        label: 'Settings',
        icon: Settings,
        href: '/settings',
        color: 'text-gray-500',
      },
    ];

    // Doctor-specific items (5 items)
    const doctorItems = [
      {
        label: 'My Schedule',
        icon: Clock,
        href: '/doctor/schedule',
        color: 'text-blue-500',
      },
      {
        label: 'Appointments',
        icon: Calendar,
        href: '/doctor/appointments',
        color: 'text-green-500',
      },
      {
        label: 'My Patients',
        icon: Users,
        href: '/doctor/patients',
        color: 'text-purple-500',
      },
      {
        label: 'Earnings',
        icon: BarChart3,
        href: '/doctor/earnings',
        color: 'text-emerald-500',
      },
      {
        label: 'Settings',
        icon: Settings,
        href: '/doctor/settings',
        color: 'text-gray-500',
      },
    ];

    // Admin-specific items (5 items)
    const adminItems = [
      {
        label: 'Admin Dashboard',
        icon: BarChart3,
        href: '/admin/dashboard',
        color: 'text-red-500',
      },
      {
        label: 'User Management',
        icon: Users,
        href: '/admin/users',
        color: 'text-blue-500',
      },
      {
        label: 'Doctor Management',
        icon: Stethoscope,
        href: '/admin/doctors',
        color: 'text-green-500',
      },
      {
        label: 'Appointments',
        icon: Calendar,
        href: '/admin/appointments',
        color: 'text-purple-500',
      },
      {
        label: 'Settings',
        icon: UserCog,
        href: '/admin/settings',
        color: 'text-gray-500',
      },
    ];

    // Return items based on role
    if (role === 'admin') {
      return [...commonItems, ...adminItems];
    } else if (role === 'doctor') {
      return [...commonItems, ...doctorItems];
    } else {
      return [...commonItems, ...patientItems];
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" fill="white" />
            </div>
            <span className="font-bold text-xl text-gray-800">HealthHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? 'text-blue-500'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth - with Avatar */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                {/* Avatar Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none group"
                >
                  <div className="relative">
                    {/* Avatar Circle with Initials */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-lg transition-all">
                      {getInitials(user?.name || 'User')}
                    </div>
                    {/* Online Status Dot */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  
                  {/* User Name with Chevron */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                            {getInitials(user?.name || 'User')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user?.email || 'user@email.com'}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                                user?.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {getRoleDisplay(user?.role || 'patient')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items - Role Based (4-5 items) */}
                      <div className="py-1">
                        {getDropdownItems().map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                          >
                            <item.icon className={`h-4 w-4 ${item.color}`} />
                            {item.label}
                          </Link>
                        ))}

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-500"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'text-blue-500'
                      : 'text-gray-600 hover:text-blue-500'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                      {getInitials(user?.name || 'User')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user?.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {getRoleDisplay(user?.role || 'patient')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-sm text-red-500 hover:text-red-600 font-medium text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-blue-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};