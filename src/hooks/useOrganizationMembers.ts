import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'member';
  email: string;
  created_at: string;
}

export function useOrganizationMembers(organizationId: string | null) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMembers = useCallback(async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      setError(null);

      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      console.log('Loading organization members...');
      
      // First get the members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId);

      if (membersError) throw membersError;

      // Then get the user emails using our secure function
      const userIds = membersData?.map(m => m.user_id) || [];
      if (userIds.length === 0) {
        setMembers([]);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .rpc('get_user_emails', { user_ids: userIds });

      if (userError) throw userError;

      // Combine the data
      const membersWithEmail = membersData?.map(member => ({
        ...member,
        email: userData?.find(u => u.id === member.user_id)?.email || 'Unknown'
      }));

      console.log('Loaded members:', membersWithEmail);
      setMembers(membersWithEmail || []);
    } catch (err) {
      console.error('Failed to load members:', err);
      setError(err instanceof Error ? err : new Error('Failed to load members'));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const addMember = async (email: string, role: 'admin' | 'member' = 'member') => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!email) {
      throw new Error('Email is required');
    }

    try {
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      // Add member using our secure function
      const { data, error } = await supabase
        .rpc('add_organization_member', {
          org_id: organizationId,
          member_email: email,
          member_role: role
        });

      if (error) {
        console.error('Failed to add member:', error);
        throw new Error(error.message || 'Failed to add member');
      }

      // Refresh member list to get updated data
      await loadMembers();

      return data;
    } catch (err) {
      console.error('Failed to add member:', err);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Failed to add member');
    }
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member') => {
    if (!memberId) {
      throw new Error('Member ID is required');
    }

    if (!role) {
      throw new Error('Role is required');
    }

    try {
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      // Check if user can manage organization
      const { data: canManage, error: checkError } = await supabase
        .rpc('can_manage_organization', { org_id: organizationId });

      if (checkError) throw checkError;
      if (!canManage) throw new Error('Permission denied');

      const { data, error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();

      if (error) {
        console.error('Role update error:', error);
        throw new Error(error.message || 'Failed to update member role');
      }

      // Refresh member list to get updated data
      await loadMembers();

      return data;
    } catch (err) {
      console.error('Failed to update member role:', err);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Failed to update member role');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!memberId) {
      throw new Error('Member ID is required');
    }

    try {
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      // Check if user can manage organization
      const { data: canManage, error: checkError } = await supabase
        .rpc('can_manage_organization', { org_id: organizationId });

      if (checkError) throw checkError;
      if (!canManage) throw new Error('Permission denied');

      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Member remove error:', error);
        throw new Error(error.message || 'Failed to remove member');
      }

      // Refresh member list to get updated data
      await loadMembers();
    } catch (err) {
      console.error('Failed to remove member:', err);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Failed to remove member');
    }
  };

  return {
    members,
    loading,
    error,
    addMember,
    updateMemberRole,
    removeMember,
    refresh: loadMembers
  };
}