import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';

type UserRole = 'admin' | 'branch_manager' | 'staff' | 'accountant';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch_id: string | null;
}

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: UserRole, branchId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  getCurrentUserBranch: () => Branch | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userData: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  getCurrentUserBranch: () => null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setUserData(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        setUserData(data as UserData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch user data'));
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      setSession(data.session);
      setUser(data.user);
      
      if (data.user) {
        await fetchUserData(data.user.id);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign in'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole = 'staff', 
    branchId?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name,
          email,
          role,
          branch_id: branchId || null,
        });

      if (profileError) {
        // Attempt to clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Don't automatically sign in - require email verification first
      setLoading(false);
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign up'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign out'));
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserBranch = (): Branch | null => {
    if (!userData?.branch_id) return null;
    
    // In a real implementation, you would fetch this from the branches table
    // For now, we'll return a mock branch if we have a branch_id
    return {
      id: userData.branch_id,
      name: 'Current Branch',
      code: 'CURR',
      city: 'Mumbai',
      state: 'Maharashtra'
    };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userData,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        getCurrentUserBranch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}