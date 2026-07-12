'use client';

import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  if (!googleClientId) {
    console.error('❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set in .env.local');
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <NextUIProvider>
        <NextThemesProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem={false}
          forcedTheme="light"
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </GoogleOAuthProvider>
  );
}