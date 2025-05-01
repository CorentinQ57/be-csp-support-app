'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../navigation/Sidebar';
import Navbar from '../navigation/Navbar';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Redirecting to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user && !pathname.startsWith('/auth/')) {
      router.push('/auth/login');
    }
  }, [user, loading, router, pathname]);

  // Return loading spinner during initial loading or if user is not authenticated
  if (loading || (!user && !pathname.startsWith('/auth/'))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-be-csp-accent"></div>
          <p className="mt-4 text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Don't render the sidebar and navbar on auth pages
  if (pathname.startsWith('/auth/')) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
} 