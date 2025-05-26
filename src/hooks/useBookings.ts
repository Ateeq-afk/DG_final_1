import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

// Loosened UUID validation regex (matches any UUID version)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

      const validBranchId = branchId && isValidUUID(branchId);
      const validUserBranchId = userBranch?.id && isValidUUID(userBranch.id);

      if ((branchId && !validBranchId) || (!branchId && userBranch?.id && !validUserBranchId)) {
        console.error('Invalid branch ID detected', { branchId, userBranchId: userBranch?.id });
        throw new Error('Invalid branch ID format');
      }

      const effectiveBranchId = validBranchId ? branchId : validUserBranchId ? userBranch?.id : null;

      console.log('Loading bookings for branch ID:', effectiveBranchId);

      const mockBookings: Booking[] = Array.from({ length: 25 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        const statuses: Booking['status'][] = ['booked', 'in_transit', 'delivered', 'cancelled'];
        const status = statuses[Math.floor(Math.random() * (i % 4 === 0 ? 4 : 3))];

        const paymentTypes: Booking['payment_type'][] = ['Paid', 'To Pay', 'Quotation'];
        const paymentType = paymentTypes[Math.floor(Math.random() * 3)];

        const quantity = Math.floor(Math.random() * 10) + 1;
        const freightPerQty = Math.floor(Math.random() * 200) + 50;
        const loadingCharges = Math.floor(Math.random() * 100);
        const unloadingCharges = Math.floor(Math.random() * 100);
        const totalAmount = (quantity * freightPerQty) + loadingCharges + unloadingCharges;

        const lrNumber = `LR-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${(i + 1).toString().padStart(4, '0')}`;

        const fromBranchId = effectiveBranchId || '123e4567-e89b-12d3-a456-426614174000';

        const toBranchOptions = [
          '223e4567-e89b-12d3-a456-426614174001',
          '323e4567-e89b-12d3-a456-426614174002',
          '423e4567-e89b-12d3-a456-426614174003'
        ];
        const toBranchId = toBranchOptions[Math.floor(Math.random() * toBranchOptions.length)];

        return {
          id: `123e4567-e89b-12d3-a456-42661417${(4000 + i).toString()}`,
          branch_id: fromBranchId,
          lr_number: lrNumber,
          lr_type: Math.random() > 0.2 ? 'system' : 'manual',
          manual_lr_number: Math.random() > 0.2 ? null : `M${Math.floor(Math.random() * 10000)}`,
          from_branch: fromBranchId,
          to_branch: toBranchId,
          sender_id: `123e4567-e89b-12d3-a456-42661417${(5000 + Math.floor(Math.random() * 5)).toString()}`,
          receiver_id: `123e4567-e89b-12d3-a456-42661417${(6000 + Math.floor(Math.random() * 5)).toString()}`,
          article_id: `123e4567-e89b-12d3-a456-42661417${(7000 + Math.floor(Math.random() * 5)).toString()}`,
          description: Math.random() > 0.5 ? `Sample shipment ${i + 1}` : null,
          uom: ['Fixed', 'KG', 'Pieces', 'Boxes', 'Bundles'][Math.floor(Math.random() * 5)],
          actual_weight: Math.floor(Math.random() * 100) + 1,
          quantity,
          freight_per_qty: freightPerQty,
          loading_charges: loadingCharges,
          unloading_charges: unloadingCharges,
          total_amount: totalAmount,
          private_mark_number: Math.random() > 0.7 ? `PMN${Math.floor(Math.random() * 1000)}` : null,
          remarks: Math.random() > 0.7 ? `Handle with care. Delivery priority ${Math.floor(Math.random() * 3) + 1}.` : null,
          payment_type: paymentType,
          status,
          created_at: date.toISOString(),
          updated_at: date.toISOString(),
          has_invoice: Math.random() > 0.5,
          invoice_number: Math.random() > 0.5 ? `INV-${Math.floor(Math.random() * 10000)}` : null,
          invoice_amount: Math.random() > 0.5 ? Math.floor(Math.random() * 10000) + 1000 : null,
          invoice_date: Math.random() > 0.5 ? new Date(date.getTime() - Math.floor(Math.random() * 86400000 * 5)).toISOString().split('T')[0] : null,
          eway_bill_number: Math.random() > 0.6 ? `EWB${Math.floor(Math.random() * 10000000)}` : null,
          delivery_type: ['Standard', 'Express', 'Same Day'][Math.floor(Math.random() * 3)],
          insurance_required: Math.random() > 0.7,
          insurance_value: Math.random() > 0.7 ? Math.floor(Math.random() * 5000) + 1000 : null,
          insurance_charge: Math.random() > 0.7 ? Math.floor(Math.random() * 500) + 100 : 0,
          fragile: Math.random() > 0.7,
          priority: ['Normal', 'High', 'Urgent'][Math.floor(Math.random() * 3)],
          expected_delivery_date: Math.random() > 0.5 ? new Date(date.getTime() + Math.floor(Math.random() * 86400000 * 7)).toISOString().split('T')[0] : null,
          packaging_type: Math.random() > 0.6 ? ['Standard', 'Bubble Wrap', 'Wooden Crate', 'Cardboard Box'][Math.floor(Math.random() * 4)] : null,
          packaging_charge: Math.random() > 0.6 ? Math.floor(Math.random() * 300) : 0,
          special_instructions: Math.random() > 0.8 ? 'Handle with extra care. Call receiver before delivery.' : null,
          reference_number: Math.random() > 0.7 ? `REF-${Math.floor(Math.random() * 10000)}` : null,
          sender: {
            id: `123e4567-e89b-12d3-a456-42661417${(5000 + Math.floor(Math.random() * 5)).toString()}`,
            branch_id: fromBranchId,
            name: `Sender ${i % 5 + 1}`,
            mobile: `98765${(43210 + i).toString().padStart(5, '0')}`,
            type: Math.random() > 0.5 ? 'individual' : 'company',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          receiver: {
            id: `123e4567-e89b-12d3-a456-42661417${(6000 + Math.floor(Math.random() * 5)).toString()}`,
            branch_id: toBranchId,
            name: `Receiver ${i % 7 + 1}`,
            mobile: `98765${(12345 + i).toString().padStart(5, '0')}`,
            type: Math.random() > 0.5 ? 'individual' : 'company',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          article: {
            id: `123e4567-e89b-12d3-a456-42661417${(7000 + Math.floor(Math.random() * 5)).toString()}`,
            branch_id: fromBranchId,
            name: ['Cloth Bundle', 'Cloth Box', 'Garments', 'Fabric Rolls', 'Textile Machinery'][Math.floor(Math.random() * 5)],
            description: ['Standard cloth bundles', 'Boxed cloth materials', 'Ready-made garments', 'Rolled fabric materials', 'Textile manufacturing equipment'][Math.floor(Math.random() * 5)],
            base_rate: freightPerQty,
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          from_branch_details: {
            id: fromBranchId,
            name: 'Mumbai HQ',
            code: 'MUM-HQ',
            address: '123 Business Park, Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400069',
            phone: '022-12345678',
            email: 'mumbai@k2k.com',
            is_head_office: true,
            status: 'active',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          to_branch_details: {
            id: toBranchId,
            name: ['Delhi Branch', 'Bangalore Branch', 'Chennai Branch'][Math.floor(Math.random() * 3)],
            code: ['DEL-01', 'BLR-01', 'CHN-01'][Math.floor(Math.random() * 3)],
            address: ['456 Industrial Area, Okhla Phase 1', '789 Tech Park, Whitefield', '321 Industrial Estate, Guindy'][Math.floor(Math.random() * 3)],
            city: ['Delhi', 'Bangalore', 'Chennai'][Math.floor(Math.random() * 3)],
            state: ['Delhi', 'Karnataka', 'Tamil Nadu'][Math.floor(Math.random() * 3)],
            pincode: ['110020', '560066', '600032'][Math.floor(Math.random() * 3)],
            phone: ['011-12345678', '080-12345678', '044-12345678'][Math.floor(Math.random() * 3)],
            email: ['delhi@k2k.com', 'bangalore@k2k.com', 'chennai@k2k.com'][Math.floor(Math.random() * 3)],
            is_head_office: false,
            status: 'active',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          }
        };
      });

      mockBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const filteredBookings = effectiveBranchId
        ? mockBookings.filter(b =>
            b.from_branch === effectiveBranchId || b.to_branch === effectiveBranchId
          )
        : mockBookings;

      setBookings(filteredBookings as unknown as T[]);
      console.log('Bookings loaded:', filteredBookings.length);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError(err instanceof Error ? err : new Error('Failed to load bookings'));
      setBookings([] as unknown as T[]);
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
      
      // Validate branch IDs
      if (data.branch_id && !isValidUUID(data.branch_id)) {
        throw new Error('Invalid branch ID format');
      }
      if (data.from_branch && !isValidUUID(data.from_branch)) {
        throw new Error('Invalid from_branch ID format');
      }
      if (data.to_branch && !isValidUUID(data.to_branch)) {
        throw new Error('Invalid to_branch ID format');
      }
      
      // Calculate total amount
      const totalAmount = (data.quantity * data.freight_per_qty) + 
                          (data.loading_charges || 0) + 
                          (data.unloading_charges || 0) +
                          (data.insurance_charge || 0) +
                          (data.packaging_charge || 0);
      
      // Insert booking into Supabase
      const { data: newBooking, error: insertError } = await supabase
        .from('bookings')
        .insert({
          ...data,
          branch_id: data.branch_id || userBranch?.id,
          total_amount: totalAmount,
          status: 'booked'
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
      
      if (insertError) throw insertError;
      
      // Add to local state
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
      
      // Update booking in Supabase
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
      
      // Update the local state
      setBookings(prev => 
        prev.map(booking => 
          (booking as any).id === id ? updatedBooking : booking
        ) as T[]
      );
      
      console.log('Booking status updated successfully:', updatedBooking);
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
      
      // Delete booking from Supabase
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Update the local state
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