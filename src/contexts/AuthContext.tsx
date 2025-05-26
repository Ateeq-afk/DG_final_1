import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import LoadingScreen from '@/components/auth/LoadingScreen';

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
  const [userBranch, setUserBranch] = useState<Branch | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setUserData(null);
          setUserBranch(null);
        }
        
        setAuthInitialized(true);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setUserData(null);
          setUserBranch(null);
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
      console.log('Fetching user data for:', userId);
      
      // Use specific column selection instead of * to avoid RLS recursion issues
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, branch_id')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }
      
      if (data) {
        console.log('User data fetched:', data);
        setUserData(data as UserData);
        
        // If user has a branch_id, fetch branch details
        if (data.branch_id) {
          await fetchUserBranch(data.branch_id);
        } else {
          setUserBranch(null);
        }
      } else {
        console.warn('No user data found for ID:', userId);
        setUserData(null);
        setUserBranch(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch user data'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBranch = async (branchId: string) => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, code, city, state')
        .eq('id', branchId)
        .single();

      if (error) throw error;
      
      if (data) {
        setUserBranch(data as Branch);
      }
    } catch (error) {
      console.error('Error fetching branch data:', error);
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
      setUserBranch(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign out'));
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserBranch = (): Branch | null => {
    return userBranch;
  };

  // Show loading screen while auth is initializing
  if (!authInitialized) {
    return <LoadingScreen />;
  }

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