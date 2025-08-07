// src/lib/auth/providers/auth-provider.tsx

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  role: 'trainer' | 'client' | 'admin' | 'pending';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetchedProfile = useRef(false);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    hasFetchedProfile.current = false;
    console.log('User logged out.');
  };

  const fetchUserProfile = async (userId: string) => {
    if (hasFetchedProfile.current) {
        console.log('Profile already fetched. Skipping...');
        return;
    }
    
    console.log('Fetching user profile for:', userId);
    hasFetchedProfile.current = true;
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    } else {
      console.log('User profile fetched. Current profile:', data);
      setProfile(data as UserProfile);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('Refreshing profile...');
      hasFetchedProfile.current = false;
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    const handleAuthChange = async (session: Session | null) => {
      console.log('Auth state changed. Session:', session);
      if (session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleAuthChange(session);
      }
    );

    // Initial check on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
        handleAuthChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    logout,
    refreshProfile,
  };

  if (loading) {
    return <div>Loading Auth...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};