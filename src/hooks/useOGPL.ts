import { useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import type { OGPL } from '@/types';

export function useOGPL(organizationId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateOGPLNumber = async () => {
    try {
      // Get the latest OGPL number
      const { data: latest, error: queryError } = await supabase
        .from('ogpl')
        .select('ogpl_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (queryError) throw queryError;

      // Generate new OGPL number
      // Format: OGPL-YYYYMMDD-XXXX
      const date = new Date();
      const dateStr = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0');

      let sequence = 1;
      if (latest?.[0]?.ogpl_number) {
        const lastSequence = parseInt(latest[0].ogpl_number.split('-')[2]);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }

      return `OGPL-${dateStr}-${sequence.toString().padStart(4, '0')}`;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to generate OGPL number');
    }
  };

  const createOGPL = async (data: Omit<OGPL, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      // Generate OGPL number if not provided
      if (!data.ogpl_number) {
        data.ogpl_number = await generateOGPLNumber();
      }

      const { data: newOGPL, error: sbError } = await supabase
        .from('ogpl')
        .insert({
          ...data,
          status: 'created'
        })
        .select(`
          *,
          vehicle:vehicles(*),
          from_station:branches!from_station(*),
          to_station:branches!to_station(*)
        `)
        .single();

      if (sbError) throw sbError;
      console.log('Created OGPL:', newOGPL);
      return newOGPL;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create OGPL'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addLRsToOGPL = async (ogplId: string, bookingIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      // Create loading records
      const loadingRecords = bookingIds.map(bookingId => ({
        ogpl_id: ogplId,
        booking_id: bookingId,
        loaded_at: new Date().toISOString(),
        loaded_by: 'user1' // This would be the current user's ID
      }));

      const { data, error: sbError } = await supabase
        .from('loading_records')
        .insert(loadingRecords)
        .select();

      if (sbError) throw sbError;
      
      // Update OGPL status to in_transit
      await updateOGPLStatus(ogplId, 'in_transit');
      
      // Update booking statuses to in_transit
      for (const bookingId of bookingIds) {
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({
            status: 'in_transit',
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId);
        
        if (bookingError) {
          console.error(`Failed to update booking ${bookingId}:`, bookingError);
        }
      }
      
      console.log('Added LRs to OGPL:', data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add LRs to OGPL'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOGPLStatus = async (id: string, status: OGPL['status']) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('ogpl')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (sbError) throw sbError;
      console.log(`Updated OGPL ${id} status to ${status}`);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update OGPL status'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOGPLs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('ogpl')
        .select(`
          *,
          vehicle:vehicles(*),
          from_station:branches!from_station(*),
          to_station:branches!to_station(*),
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
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get OGPLs'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOGPLDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('ogpl')
        .select(`
          *,
          vehicle:vehicles(*),
          from_station:branches!from_station(*),
          to_station:branches!to_station(*),
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
        .eq('id', id)
        .single();

      if (sbError) throw sbError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get OGPL details'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOGPLLRs = async (ogplId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('loading_records')
        .select(`
          *,
          booking:bookings(
            *,
            sender:customers!sender_id(*),
            receiver:customers!receiver_id(*),
            article:articles(*)
          )
        `)
        .eq('ogpl_id', ogplId);

      if (sbError) throw sbError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get OGPL LRs'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createOGPL,
    addLRsToOGPL,
    updateOGPLStatus,
    getOGPLs,
    getOGPLDetails,
    getOGPLLRs,
    generateOGPLNumber
  };
}