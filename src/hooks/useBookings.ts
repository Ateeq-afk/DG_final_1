import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

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
      console.log('Loading bookings, branchId:', branchId || userBranch?.id);

      // For demo purposes, we'll create mock data
      const mockBookings: Booking[] = Array.from({ length: 25 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date in the last 30 days
        
        const statuses: Booking['status'][] = ['booked', 'in_transit', 'delivered', 'cancelled'];
        const status = statuses[Math.floor(Math.random() * (i % 4 === 0 ? 4 : 3))]; // More variety in statuses
        
        const paymentTypes: Booking['payment_type'][] = ['Paid', 'To Pay', 'Quotation'];
        const paymentType = paymentTypes[Math.floor(Math.random() * 3)];
        
        const quantity = Math.floor(Math.random() * 10) + 1;
        const freightPerQty = Math.floor(Math.random() * 200) + 50;
        const loadingCharges = Math.floor(Math.random() * 100);
        const unloadingCharges = Math.floor(Math.random() * 100);
        const totalAmount = (quantity * freightPerQty) + loadingCharges + unloadingCharges;
        
        // Generate a realistic LR number
        const lrNumber = `LR-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${(i + 1).toString().padStart(4, '0')}`;
        
        return {
          id: `booking-${i + 1}`,
          branch_id: branchId || userBranch?.id || 'branch1',
          lr_number: lrNumber,
          lr_type: Math.random() > 0.2 ? 'system' : 'manual',
          manual_lr_number: Math.random() > 0.2 ? null : `M${Math.floor(Math.random() * 10000)}`,
          from_branch: 'branch1',
          to_branch: `branch${Math.floor(Math.random() * 3) + 2}`,
          sender_id: `sender${Math.floor(Math.random() * 5) + 1}`,
          receiver_id: `receiver${Math.floor(Math.random() * 5) + 1}`,
          article_id: `article${Math.floor(Math.random() * 5) + 1}`,
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
          // Additional fields
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
          // Mock related data
          sender: {
            id: `sender${Math.floor(Math.random() * 5) + 1}`,
            branch_id: 'branch1',
            name: `Sender ${i % 5 + 1}`,
            mobile: `98765${(43210 + i).toString().padStart(5, '0')}`,
            type: Math.random() > 0.5 ? 'individual' : 'company',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          receiver: {
            id: `receiver${Math.floor(Math.random() * 5) + 1}`,
            branch_id: `branch${Math.floor(Math.random() * 3) + 2}`,
            name: `Receiver ${i % 7 + 1}`,
            mobile: `98765${(12345 + i).toString().padStart(5, '0')}`,
            type: Math.random() > 0.5 ? 'individual' : 'company',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          article: {
            id: `article${Math.floor(Math.random() * 5) + 1}`,
            branch_id: 'branch1',
            name: ['Cloth Bundle', 'Cloth Box', 'Garments', 'Fabric Rolls', 'Textile Machinery'][Math.floor(Math.random() * 5)],
            description: ['Standard cloth bundles', 'Boxed cloth materials', 'Ready-made garments', 'Rolled fabric materials', 'Textile manufacturing equipment'][Math.floor(Math.random() * 5)],
            base_rate: freightPerQty,
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          from_branch_details: {
            id: 'branch1',
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
            id: `branch${Math.floor(Math.random() * 3) + 2}`,
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
      
      // Sort by created_at in descending order (newest first)
      mockBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setBookings(mockBookings as unknown as T[]);
      console.log('Bookings loaded:', mockBookings.length);
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
      
      // In a real implementation, this would be a Supabase insert
      // For demo purposes, we'll create a mock booking
      const now = new Date();
      
      const mockBooking: Booking = {
        id: `booking-${bookings.length + 1}`,
        ...data,
        branch_id: data.branch_id || userBranch?.id || 'branch1',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        total_amount: totalAmount,
        // Add mock related data
        sender: {
          id: data.sender_id,
          branch_id: 'branch1',
          name: `Sender ${Math.floor(Math.random() * 5) + 1}`,
          mobile: `98765${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
          type: 'individual',
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        },
        receiver: {
          id: data.receiver_id,
          branch_id: data.to_branch,
          name: `Receiver ${Math.floor(Math.random() * 5) + 1}`,
          mobile: `98765${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
          type: 'individual',
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        },
        article: {
          id: data.article_id,
          branch_id: 'branch1',
          name: ['Cloth Bundle', 'Cloth Box', 'Garments', 'Fabric Rolls', 'Textile Machinery'][Math.floor(Math.random() * 5)],
          description: ['Standard cloth bundles', 'Boxed cloth materials', 'Ready-made garments', 'Rolled fabric materials', 'Textile manufacturing equipment'][Math.floor(Math.random() * 5)],
          base_rate: data.freight_per_qty,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        },
        from_branch_details: {
          id: data.from_branch,
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
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        },
        to_branch_details: {
          id: data.to_branch,
          name: 'Delhi Branch',
          code: 'DEL-01',
          address: '456 Industrial Area, Okhla Phase 1',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110020',
          phone: '011-12345678',
          email: 'delhi@k2k.com',
          is_head_office: false,
          status: 'active',
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        }
      };

      // Add to local state
      setBookings(prev => [mockBooking, ...prev] as unknown as T[]);
      
      console.log('Booking created successfully:', mockBooking);
      return mockBooking as unknown as T;
    } catch (err) {
      console.error('Failed to create booking:', err);
      throw err instanceof Error ? err : new Error('Failed to create booking');
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status'], additionalUpdates: Partial<Booking> = {}) => {
    try {
      console.log(`Updating booking ${id} status to ${status}`);
      
      // Update the local state
      setBookings(prev => 
        prev.map(booking => 
          (booking as any).id === id 
            ? { 
                ...booking, 
                ...additionalUpdates,
                status, 
                updated_at: new Date().toISOString() 
              } 
            : booking
        ) as T[]
      );
      
      console.log('Booking status updated successfully');
    } catch (err) {
      console.error('Failed to update booking status:', err);
      throw err instanceof Error ? err : new Error('Failed to update booking status');
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      console.log(`Deleting booking ${id}`);
      
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