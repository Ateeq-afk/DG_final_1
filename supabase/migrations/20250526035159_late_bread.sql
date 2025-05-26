/*
  # Fix RLS policies for users table

  1. Security
    - Drop existing policies that cause infinite recursion
    - Create simplified policies for user access control
*/

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Branch managers can view users in their branch" ON public.users;

-- Create simplified policies
CREATE POLICY "Users can view their own row"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own row"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own row"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

-- Create a simple admin policy for viewing all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Create a simple admin policy for updating all users
CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );