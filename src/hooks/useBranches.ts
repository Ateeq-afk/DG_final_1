// src/hooks/useBranches.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Branch } from '@/types/index';

export function useBranches(organizationId?: string) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('branches')
        .select('*')
        .order('name', { ascending: true });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error: sbError } = await query;
      if (sbError) throw sbError;

      setBranches(data || []);
    } catch (err) {
      console.error('Failed to load branches:', err);
      setError(err instanceof Error ? err : new Error('Failed to load branches'));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const createBranch = async (branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: sbError } = await supabase
        .from('branches')
        .insert(branchData)
        .select()
        .single();

      if (sbError) throw sbError;
      setBranches(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to create branch:', err);
      throw err instanceof Error ? err : new Error('Failed to create branch');
    }
  };

  const updateBranch = async (id: string, updates: Partial<Branch>) => {
    try {
      const { data, error: sbError } = await supabase
        .from('branches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (sbError) throw sbError;
      setBranches(prev => prev.map(branch => branch.id === id ? data : branch));
      return data;
    } catch (err) {
      console.error('Failed to update branch:', err);
      throw err instanceof Error ? err : new Error('Failed to update branch');
    }
  };

  const deleteBranch = async (id: string) => {
    try {
      // First check if branch has any associated data
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .or(`from_branch.eq.${id},to_branch.eq.${id}`);
      
      if (bookingsError) throw bookingsError;
      
      if (bookingsCount && bookingsCount > 0) {
        throw new Error('Cannot delete branch with existing bookings');
      }
      
      // Check for users
      const { count: usersCount, error: usersError } = await supabase
        .from('branch_users')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', id);
      
      if (usersError) throw usersError;
      
      if (usersCount && usersCount > 0) {
        throw new Error('Cannot delete branch with assigned users');
      }
      
      // If no associated data, proceed with deletion
      const { error: deleteError } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      setBranches(prev => prev.filter(branch => branch.id !== id));
    } catch (err) {
      console.error('Failed to delete branch:', err);
      throw err instanceof Error ? err : new Error('Failed to delete branch');
    }
  };

  return {
    branches,
    loading,
    error,
    createBranch,
    updateBranch,
    deleteBranch,
    refresh: loadBranches
  };
}