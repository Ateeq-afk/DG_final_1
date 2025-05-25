import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { BranchUser } from '@/types';

export function useBranchUsers(branchId: string | null) {
  const [users, setUsers] = useState<BranchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUsers = useCallback(async () => {
    if (!branchId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('branch_users')
        .select('*')
        .eq('branch_id', branchId)
        .order('name');

      if (sbError) throw sbError;
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load branch users:', err);
      setError(err instanceof Error ? err : new Error('Failed to load branch users'));
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function addUser(userData: Omit<BranchUser, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error: sbError } = await supabase
        .from('branch_users')
        .insert(userData)
        .select()
        .single();

      if (sbError) throw sbError;
      setUsers(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to add branch user:', err);
      throw err instanceof Error ? err : new Error('Failed to add branch user');
    }
  }

  async function updateUser(id: string, updates: Partial<BranchUser>) {
    try {
      const { data, error: sbError } = await supabase
        .from('branch_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (sbError) throw sbError;
      setUsers(prev => prev.map(user => user.id === id ? data : user));
      return data;
    } catch (err) {
      console.error('Failed to update branch user:', err);
      throw err instanceof Error ? err : new Error('Failed to update branch user');
    }
  }

  async function removeUser(id: string) {
    try {
      const { error: sbError } = await supabase
        .from('branch_users')
        .delete()
        .eq('id', id);

      if (sbError) throw sbError;
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error('Failed to remove branch user:', err);
      throw err instanceof Error ? err : new Error('Failed to remove branch user');
    }
  }

  return {
    users,
    loading,
    error,
    addUser,
    updateUser,
    removeUser,
    refresh: loadUsers
  };
}