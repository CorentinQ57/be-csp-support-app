'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null; 
  organization: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UseUserProfileResult {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isAgent: boolean;
  refreshProfile: () => Promise<void>;
  getAllProfiles: () => Promise<UserProfile[]>;
}

export function useUserProfile(): UseUserProfileResult {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, organization, role, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Get email from auth user
      setUserProfile({
        ...data,
        email: user.email || null
      });
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllProfiles = async (): Promise<UserProfile[]> => {
    if (!isAdmin) {
      return [];
    }

    try {
      // Get profiles with joined auth user emails
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, organization, role, created_at, updated_at');

      if (error) throw error;

      // For a real implementation, you would need to use Supabase Functions or 
      // server-side code to get emails from auth.users
      // This is a simplified example
      return (data || []).map(profile => ({
        ...profile,
        email: null // Ajout du champ email manquant
      }));
    } catch (error: any) {
      console.error('Error fetching all profiles:', error);
      return [];
    }
  };

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user?.id]);

  const isAdmin = userProfile?.role === 'admin';
  const isAgent = userProfile?.role === 'agent' || isAdmin;

  return {
    userProfile,
    loading,
    error,
    isAdmin,
    isAgent,
    refreshProfile,
    getAllProfiles
  };
} 