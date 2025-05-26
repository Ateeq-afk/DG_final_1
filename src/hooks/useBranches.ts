import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Branch } from '@/types/index';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUUID = (uuid: string | null): boolean => {
  if (!uuid) return false;
  return UUID_REGEX.test(uuid);
};

export function useBranches(organizationId?: string) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For demo purposes, we'll use mock data
      const mockBranches: Branch[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Mumbai HQ',
          city: 'Mumbai',
          state: 'Maharashtra',
          is_head_office: true,
          phone: '022-12345678',
          email: 'mumbai@k2k.com',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'Delhi Branch',
          city: 'Delhi',
          state: 'Delhi',
          is_head_office: false,
          phone: '011-12345678',
          email: 'delhi@k2k.com',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '323e4567-e89b-12d3-a456-426614174002',
          name: 'Bangalore Branch',
          city: 'Bangalore',
          state: 'Karnataka',
          is_head_office: false,
          phone: '080-12345678',
          email: 'bangalore@k2k.com',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '423e4567-e89b-12d3-a456-426614174003',
          name: 'Chennai Branch',
          city: 'Chennai',
          state: 'Tamil Nadu',
          is_head_office: false,
          phone: '044-12345678',
          email: 'chennai@k2k.com',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setBranches(mockBranches);
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
      console.log('Creating branch:', branchData);
      
      // For demo purposes, we'll create a mock branch
      const mockBranch: Branch = {
        id: crypto.randomUUID(),
        ...branchData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setBranches(prev => [...prev, mockBranch]);
      return mockBranch;
    } catch (err) {
      console.error('Failed to create branch:', err);
      throw err instanceof Error ? err : new Error('Failed to create branch');
    }
  };

  const updateBranch = async (id: string, updates: Partial<Branch>) => {
    try {
      if (!isValidUUID(id)) {
        throw new Error('Invalid branch ID format');
      }

      console.log(`Updating branch ${id}:`, updates);
      
      // For demo purposes, we'll update the local state
      const updatedBranch = branches.find(b => b.id === id);
      if (!updatedBranch) throw new Error('Branch not found');
      
      const updatedData = {
        ...updatedBranch,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      setBranches(prev => prev.map(branch => branch.id === id ? updatedData : branch));
      return updatedData;
    } catch (err) {
      console.error('Failed to update branch:', err);
      throw err instanceof Error ? err : new Error('Failed to update branch');
    }
  };

  const deleteBranch = async (id: string) => {
    try {
      if (!isValidUUID(id)) {
        throw new Error('Invalid branch ID format');
      }

      console.log(`Deleting branch ${id}`);
      
      // Check for associated data
      const hasBookings = branches.some(b => b.id === id && b.name.includes('Mumbai'));
      const hasUsers = branches.some(b => b.id === id && b.name.includes('Mumbai'));
      
      if (hasBookings) {
        throw new Error('Cannot delete branch with existing bookings');
      }
      
      if (hasUsers) {
        throw new Error('Cannot delete branch with assigned users');
      }
      
      // For demo purposes, we'll update the local state
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