import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { OGPL } from '@/types';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function useUnloading(organizationId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showSuccess, showError } = useNotificationSystem();

  const getIncomingOGPLs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('ogpl')
        .select(`
          *,
          vehicle:vehicles(*),
          from_station_details:branches!from_station(*),
          to_station_details:branches!to_station(*),
          loading_records(
            *,
            booking:bookings(
              *,
              sender:customers!sender_id(*),
              receiver:customers!receiver_id(*),
              article:articles(*)
            )
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'in_transit')
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;
      return data || [];
    } catch (err) {
      console.error('Failed to get incoming OGPLs:', err);
      setError(err instanceof Error ? err : new Error('Failed to get incoming OGPLs'));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const unloadOGPL = async (
    ogplId: string, 
    bookingIds: string[], 
    conditions: Record<string, { status: string; remarks?: string; photo?: string }>
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Unloading OGPL:', ogplId);
      console.log('Booking IDs:', bookingIds);
      console.log('Conditions:', conditions);

      // Validate conditions
      const hasInvalidEntries = Object.entries(conditions).some(([bookingId, condition]) => {
        if (condition.status === 'damaged' && !condition.remarks) {
          showError('Validation Error', 'Please provide remarks for all damaged items');
          return true;
        }
        return false;
      });
      
      if (hasInvalidEntries) {
        throw new Error('Please provide remarks for all damaged items');
      }

      // 1. Create unloading record
      const { data: unloadingRecord, error: unloadingError } = await supabase
        .from('unloading_records')
        .insert({
          ogpl_id: ogplId,
          unloaded_at: new Date().toISOString(),
          unloaded_by: 'user1', // This would be the current user's ID
          conditions
        })
        .select()
        .single();

      if (unloadingError) throw unloadingError;

      // 2. Update OGPL status
      const { error: ogplError } = await supabase
        .from('ogpl')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', ogplId);

      if (ogplError) throw ogplError;

      // 3. Update booking statuses to 'delivered'
      for (const bookingId of bookingIds) {
        const condition = conditions[bookingId];
        
        // Only mark as delivered if not missing
        if (condition && condition.status !== 'missing') {
          const { error: bookingError } = await supabase
            .from('bookings')
            .update({
              status: 'delivered',
              updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);
          
          if (bookingError) {
            console.error(`Failed to update booking ${bookingId}:`, bookingError);
          }
        }
      }
      
      showSuccess('Unloading Complete', 'All items have been successfully unloaded');
      return unloadingRecord;
    } catch (err) {
      console.error('Failed to unload OGPL:', err);
      setError(err instanceof Error ? err : new Error('Failed to unload OGPL'));
      showError('Unloading Failed', err instanceof Error ? err.message : 'Failed to unload OGPL');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCompletedUnloadings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('unloading_records')
        .select(`
          *,
          ogpl(
            *,
            vehicle:vehicles(*),
            from_station_details:branches!from_station(*),
            to_station_details:branches!to_station(*),
            loading_records(
              *,
              booking:bookings(
                *,
                sender:customers!sender_id(*),
                receiver:customers!receiver_id(*),
                article:articles(*)
              )
            )
          )
        `)
        .order('unloaded_at', { ascending: false });

      if (sbError) throw sbError;
      return data || [];
    } catch (err) {
      console.error('Failed to get completed unloadings:', err);
      setError(err instanceof Error ? err : new Error('Failed to get completed unloadings'));
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getIncomingOGPLs,
    unloadOGPL,
    getCompletedUnloadings
  };
}