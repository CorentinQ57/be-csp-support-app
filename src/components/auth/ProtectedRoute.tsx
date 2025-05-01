
'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  // Optional: Add roles/permissions check later
  // allowedRoles?: string[]; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user session exists, redirect to login
    if (!loading && !session) {
      router.push('/auth/login');
    }
    // Optional: Add role checking logic here later
    // if (!loading && session && allowedRoles && !allowedRoles.includes(user?.role)) {
    //   router.push('/unauthorized'); // Or some other page
    // }
  }, [session, loading, router, user]); // Add user if role checking is implemented

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p> {/* Replace with a proper spinner/loader component */}
      </div>
    );
  }

  // If session exists, render the protected content
  if (session) {
    return <>{children}</>;
  }

  // If no session and not loading (should have been redirected, but as a fallback)
  return null; 
};

export default ProtectedRoute;

