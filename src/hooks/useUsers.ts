import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  organizations: string[];
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface PaginationParams {
  page: number;
  perPage: number;
}

interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  organizationId?: string;
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
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters?.search) {
        query = query.ilike('email', `%${filters.search}%`);
      }
      if (filters?.role) {
        query = query.eq('role', filters.role);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
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

  const inviteUser = async (email: string, role: string, organizationIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      // First check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
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
          role,
          status: 'inactive'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add organization memberships
      const memberships = organizationIds.map(orgId => ({
        user_id: user.id,
        organization_id: orgId,
        role: role
      }));

      const { error: membershipError } = await supabase
        .from('organization_members')
        .insert(memberships);

      if (membershipError) throw membershipError;

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
        .select()
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

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError(err instanceof Error ? err : new Error('Failed to update user status'));
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
    updateUserStatus
  };
}

// Helper function to calculate pagination range
function getPaginationRange(params: PaginationParams) {
  const from = (params.page - 1) * params.perPage;
  const to = from + params.perPage - 1;
  return { from, to };
}