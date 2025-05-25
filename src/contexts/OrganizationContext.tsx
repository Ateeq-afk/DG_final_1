import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Organization } from '@/types';

interface OrganizationContextType {
  organizations: Organization[];
  selectedOrganizationId: string | null;
  selectOrganization: (id: string) => void;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Cache keys
const CACHE_KEYS = {
  ORGANIZATIONS: 'organizations',
  SELECTED_ORG: 'selected_organization_id'
};

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
}

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    // Try to load from cache first
    const cached = localStorage.getItem(CACHE_KEYS.ORGANIZATIONS);
    return cached ? JSON.parse(cached) : [];
  });

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(() => {
    return localStorage.getItem(CACHE_KEYS.SELECTED_ORG);
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const loadOrganization = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to get K2K organization
      const { data: existingOrg, error: queryError } = await supabase
        .from('organizations')
        .select('*')
        .eq('name', 'k2k-logistics')
        .maybeSingle();

      if (queryError) throw queryError;

      if (!existingOrg) {
        // Create K2K organization if it doesn't exist
        const { data: newOrg, error: createError } = await supabase
          .from('organizations')
          .insert({
            name: 'k2k-logistics',
            slug: 'k2k-logistics',
            display_name: 'K2K Logistics'
          })
          .select()
          .single();

        if (createError) throw createError;

        setOrganizations([newOrg]);
        setSelectedOrganizationId(newOrg.id);
        localStorage.setItem(CACHE_KEYS.ORGANIZATIONS, JSON.stringify([newOrg]));
        localStorage.setItem(CACHE_KEYS.SELECTED_ORG, newOrg.id);
      } else {
        setOrganizations([existingOrg]);
        setSelectedOrganizationId(existingOrg.id);
        localStorage.setItem(CACHE_KEYS.ORGANIZATIONS, JSON.stringify([existingOrg]));
        localStorage.setItem(CACHE_KEYS.SELECTED_ORG, existingOrg.id);
      }

      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Failed to load/create organization:', err);
      setError(err instanceof Error ? err : new Error('Failed to load organization'));
      
      // Retry with exponential backoff
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(loadOrganization, delay);
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load organization on mount
  useEffect(() => {
    loadOrganization();
  }, []);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadOrganization();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CACHE_KEYS.ORGANIZATIONS || e.key === CACHE_KEYS.SELECTED_ORG) {
        loadOrganization();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value: OrganizationContextType = {
    organizations,
    selectedOrganizationId,
    selectOrganization: setSelectedOrganizationId,
    loading,
    error,
    refresh: loadOrganization
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}