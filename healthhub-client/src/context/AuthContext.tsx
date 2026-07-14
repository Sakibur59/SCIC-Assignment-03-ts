'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.getMe();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.login({ email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      
      setUser(response.data.user);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setLoading(true);
      const response = await api.register(data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      
      setUser(response.data.user);
      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = async () => {
    try {
      const response = await api.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const setUserData = (userData: User | null) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    setUser: setUserData,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};