import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

export async function signUp(email: string, password: string) {
  console.log('Mock sign up with:', email);
  return {
    user: null,
    session: {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600, 
      expires_at: new Date().getTime() + 3600 * 1000,
      token_type: 'bearer',
      user: null
    }
  };
}

export async function signIn(email: string, password: string, rememberMe: boolean = false) {
  console.log('Mock sign in with:', email);
  localStorage.setItem('rememberMe', rememberMe.toString());
  return {
    user: null,
    session: {
      access_token: 'mock-token', 
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: new Date().getTime() + 3600 * 1000,
      token_type: 'bearer',
      user: null
    }
  };
}

export async function signOut(redirect: boolean = true) {
  console.log('Mock sign out'); 
  return { error: null };
}

export async function resetPassword(email: string) {
  console.log('Mock reset password for:', email);
  return { error: null };
}

export async function updatePassword(newPassword: string) {
  console.log('Mock update password');
  return { error: null };
}

export async function verifyEmail(token: string) {
  console.log('Mock verify email with token:', token);
  return { error: null };
}

export async function resendVerificationEmail(email: string) {
  console.log('Mock resend verification email to:', email);
  return { error: null };
}

export async function getCurrentUser(): Promise<User | null> {
  return null;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  // Immediately call the callback with null user
  callback(null);
  
  // Return a dummy subscription
  return {
    unsubscribe: () => {}
  };
}