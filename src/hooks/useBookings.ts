import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUUID = (uuid: string | null): boolean => {
  if (!uuid) return false;
  return UUID_REGEX.test(uuid);
};

export function useBookings<T = Booking>(branchId: string | null = null) {
  const [bookings, setBookings] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getCurrentUserBranch } = useAuth();
  const userBranch = getCurrentUserBranch();

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate branch IDs
      const validBranchId = branchId && isValidUUID(branchId);
      const validUserBranchId = userBranch?.id && isValidUUID(userBranch.id);

      if ((branchId && !validBranchId) || (!branchId && userBranch?.id && !validUserBranchId)) {
        throw new Error('Invalid branch ID format');
      }

      console.log('Loading bookings, branchId:', validBranchId ? branchId : userBranch?.id);

      let query = supabase
        .from('bookings')
        .select(`
          *,
          sender:customers!sender_id(*),
          receiver:customers!receiver_id(*),
          article:articles(*),
          from_branch_details:branches!from_branch(*),
          to_branch_details:branches!to_branch(*)
        `)
        .order('created_at', { ascending: false });

      // Only apply branch filter if we have a valid UUID
      if (validBranchId) {
        query = query.or(`from_branch.eq.${branchId},to_branch.eq.${branchId}`);
      } else if (validUserBranchId) {
        query = query.or(`from_branch.eq.${userBranch.id},to_branch.eq.${userBranch.id}`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setBookings(data as unknown as T[]);
      console.log('Bookings loaded:', data?.length);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError(err instanceof Error ? err : new Error('Failed to load bookings'));
    } finally {
      setLoading(false);
    }
  }, [branchId, userBranch]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const createBooking = async (data: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'total_amount'>) => {
    try {
      console.log('Creating booking with data:', data);
      
      // Calculate total amount
      const totalAmount = (data.quantity * data.freight_per_qty) + 
                          (data.loading_charges || 0) + 
                          (data.unloading_charges || 0) +
                          (data.insurance_charge || 0) +
                          (data.packaging_charge || 0);
      
      const { data: newBooking, error: createError } = await supabase
        .from('bookings')
        .insert({
          ...data,
          total_amount: totalAmount
        })
        .select(`
          *,
          sender:customers!sender_id(*),
          receiver:customers!receiver_id(*),
          article:articles(*),
          from_branch_details:branches!from_branch(*),
          to_branch_details:branches!to_branch(*)
        `)
        .single();

      if (createError) throw createError;
      
      setBookings(prev => [newBooking, ...prev] as unknown as T[]);
      console.log('Booking created successfully:', newBooking);
      return newBooking as unknown as T;
    } catch (err) {
      console.error('Failed to create booking:', err);
      throw err instanceof Error ? err : new Error('Failed to create booking');
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status'], additionalUpdates: Partial<Booking> = {}) => {
    try {
      if (!isValidUUID(id)) {
        throw new Error('Invalid booking ID format');
      }

      console.log(`Updating booking ${id} status to ${status}`);
      
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({
          ...additionalUpdates,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          sender:customers!sender_id(*),
          receiver:customers!receiver_id(*),
          article:articles(*),
          from_branch_details:branches!from_branch(*),
          to_branch_details:branches!to_branch(*)
        `)
        .single();

      if (updateError) throw updateError;
      
      setBookings(prev => 
        prev.map(booking => 
          (booking as any).id === id ? updatedBooking : booking
        ) as T[]
      );
      
      console.log('Booking status updated successfully');
      return updatedBooking;
    } catch (err) {
      console.error('Failed to update booking status:', err);
      throw err instanceof Error ? err : new Error('Failed to update booking status');
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      if (!isValidUUID(id)) {
        throw new Error('Invalid booking ID format');
      }

      console.log(`Deleting booking ${id}`);
      
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setBookings(prev => prev.filter(booking => (booking as any).id !== id) as T[]);
      
      console.log('Booking deleted successfully');
    } catch (err) {
      console.error('Failed to delete booking:', err);
      throw err instanceof Error ? err : new Error('Failed to delete booking');
    }
  };

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    deleteBooking,
    refresh: loadBookings
  };
}