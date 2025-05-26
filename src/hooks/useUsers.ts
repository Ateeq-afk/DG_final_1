import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'branch_manager' | 'staff' | 'accountant';
  branch_id: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginationParams {
  page: number;
  perPage: number;
}

interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  branchId?: string;
}

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async (
    pagination: PaginationParams,
    filters?: UserFilters
  ) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('users')
        .select('id, name, email, role, branch_id, created_at, updated_at', { count: 'exact' });

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      if (filters?.role) {
        query = query.eq('role', filters.role);
      }
      if (filters?.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }

      // Apply pagination
      const { from, to } = getPaginationRange(pagination);
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setUsers(data || []);
      if (count !== null) setTotalCount(count);

      return { data, count };
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
      return { data: [], count: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteUser = async (email: string, role: string, branchId?: string) => {
    try {
      setLoading(true);
      setError(null);

      // First check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Send invitation email
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
      if (inviteError) throw inviteError;

      // Create user record
      const { data: user, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          name: email.split('@')[0], // Temporary name from email
          role,
          branch_id: branchId || null
        })
        .select('id, name, email, role, branch_id')
        .single();

      if (createError) throw createError;

      return user;
    } catch (err) {
      console.error('Failed to invite user:', err);
      setError(err instanceof Error ? err : new Error('Failed to invite user'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select('id, name, email, role, branch_id')
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError(err instanceof Error ? err : new Error('Failed to update user role'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserBranch = async (userId: string, branchId: string | null) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .update({ branch_id: branchId })
        .eq('id', userId)
        .select('id, name, email, role, branch_id')
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to update user branch:', err);
      setError(err instanceof Error ? err : new Error('Failed to update user branch'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    totalCount,
    loading,
    error,
    fetchUsers,
    inviteUser,
    updateUserRole,
    updateUserBranch
  };
}

// Helper function to calculate pagination range
function getPaginationRange(params: PaginationParams) {
  const from = (params.page - 1) * params.perPage;
  const to = from + params.perPage - 1;
  return { from, to };
}