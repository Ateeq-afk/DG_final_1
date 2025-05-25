import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Customer } from '@/types';

export function useCustomers(branchId: string | null = null) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading customers, branchId:', branchId);

      // For demo purposes, we'll use mock data
      const mockCustomers: Customer[] = [
        {
          id: 'sender1',
          branch_id: 'branch1',
          name: 'John Doe',
          mobile: '9876543210',
          gst: 'GSTIN9876543210',
          type: 'individual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          branch_name: 'Mumbai HQ',
          branch_code: 'MUM-HQ',
          email: 'john.doe@example.com',
          address: '123 Main Street, Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400069',
          credit_limit: 5000,
          payment_terms: 'net30'
        },
        {
          id: 'receiver1',
          branch_id: 'branch2',
          name: 'Jane Smith',
          mobile: '9876543211',
          type: 'individual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          branch_name: 'Delhi Branch',
          branch_code: 'DEL-01',
          email: 'jane.smith@example.com',
          address: '456 Park Avenue, Connaught Place',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        {
          id: 'customer3',
          branch_id: 'branch1',
          name: 'Textile Hub',
          mobile: '9876543212',
          gst: 'GSTIN9876543212',
          type: 'company',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          branch_name: 'Mumbai HQ',
          branch_code: 'MUM-HQ',
          email: 'contact@textilehub.com',
          address: '789 Business Park, Worli',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400018',
          credit_limit: 50000,
          payment_terms: 'net45'
        },
        {
          id: 'customer4',
          branch_id: 'branch3',
          name: 'Fashion World',
          mobile: '9876543213',
          gst: 'GSTIN9876543213',
          type: 'company',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          branch_name: 'Bangalore Branch',
          branch_code: 'BLR-01',
          email: 'info@fashionworld.com',
          address: '321 Tech Park, Whitefield',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560066',
          credit_limit: 25000,
          payment_terms: 'net30'
        },
        {
          id: 'customer5',
          branch_id: 'branch2',
          name: 'Garment Express',
          mobile: '9876543214',
          gst: 'GSTIN9876543214',
          type: 'company',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          branch_name: 'Delhi Branch',
          branch_code: 'DEL-01',
          email: 'support@garmentexpress.com',
          address: '567 Industrial Area, Okhla',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110020',
          credit_limit: 35000,
          payment_terms: 'net60'
        },
        {
          id: 'customer6',
          branch_id: 'branch3',
          name: 'Rahul Verma',
          mobile: '9876543215',
          type: 'individual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          branch_name: 'Bangalore Branch',
          branch_code: 'BLR-01',
          email: 'rahul.verma@example.com',
          address: '890 Residential Colony, Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560034'
        },
        {
          id: 'customer7',
          branch_id: 'branch1',
          name: 'Priya Sharma',
          mobile: '9876543216',
          type: 'individual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          branch_name: 'Mumbai HQ',
          branch_code: 'MUM-HQ',
          email: 'priya.sharma@example.com',
          address: '234 Apartment Complex, Bandra',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050'
        },
        {
          id: 'customer8',
          branch_id: 'branch2',
          name: 'Style Solutions',
          mobile: '9876543217',
          gst: 'GSTIN9876543217',
          type: 'company',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          branch_name: 'Delhi Branch',
          branch_code: 'DEL-01',
          email: 'hello@stylesolutions.com',
          address: '678 Commercial Complex, Nehru Place',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110019',
          credit_limit: 40000,
          payment_terms: 'net45'
        }
      ];
      
      // Filter by branch if specified
      const filteredCustomers = branchId 
        ? mockCustomers.filter(c => c.branch_id === branchId)
        : mockCustomers;
      
      setCustomers(filteredCustomers);
      console.log('Customers loaded:', filteredCustomers.length);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError(err instanceof Error ? err : new Error('Failed to load customers'));
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating customer:', customerData);
      
      // Find branch name and code
      const branchName = customerData.branch_id === 'branch1' ? 'Mumbai HQ' :
                         customerData.branch_id === 'branch2' ? 'Delhi Branch' :
                         customerData.branch_id === 'branch3' ? 'Bangalore Branch' : '';
      
      const branchCode = customerData.branch_id === 'branch1' ? 'MUM-HQ' :
                         customerData.branch_id === 'branch2' ? 'DEL-01' :
                         customerData.branch_id === 'branch3' ? 'BLR-01' : '';
      
      // Create a mock customer
      const mockCustomer: Customer = {
        id: Math.random().toString(36).substring(2, 15),
        ...customerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        branch_name: branchName,
        branch_code: branchCode
      };
      
      setCustomers(prev => [mockCustomer, ...prev]);
      console.log('Customer created successfully:', mockCustomer);
      return mockCustomer;
    } catch (err) {
      console.error('Failed to create customer:', err);
      throw err instanceof Error ? err : new Error('Failed to create customer');
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      console.log(`Updating customer ${id}:`, updates);
      
      // Update the local state
      const updatedCustomer = customers.find(c => c.id === id);
      if (!updatedCustomer) throw new Error('Customer not found');
      
      // Find branch name and code if branch_id is updated
      let branchName = updatedCustomer.branch_name;
      let branchCode = updatedCustomer.branch_code;
      
      if (updates.branch_id && updates.branch_id !== updatedCustomer.branch_id) {
        branchName = updates.branch_id === 'branch1' ? 'Mumbai HQ' :
                     updates.branch_id === 'branch2' ? 'Delhi Branch' :
                     updates.branch_id === 'branch3' ? 'Bangalore Branch' : '';
        
        branchCode = updates.branch_id === 'branch1' ? 'MUM-HQ' :
                     updates.branch_id === 'branch2' ? 'DEL-01' :
                     updates.branch_id === 'branch3' ? 'BLR-01' : '';
      }
      
      const transformedData = {
        ...updatedCustomer,
        ...updates,
        branch_name: branchName,
        branch_code: branchCode,
        updated_at: new Date().toISOString()
      };
      
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? transformedData : customer
      ));
      
      console.log('Customer updated successfully:', transformedData);
      return transformedData;
    } catch (err) {
      console.error('Failed to update customer:', err);
      throw err instanceof Error ? err : new Error('Failed to update customer');
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      console.log(`Deleting customer ${id}`);
      
      // Check if customer has bookings
      const hasBookings = id === 'sender1' || id === 'receiver1';
      
      if (hasBookings) {
        throw new Error('Cannot delete customer with existing bookings');
      }
      
      // Update local state
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      console.log('Customer deleted successfully');
    } catch (err) {
      console.error('Failed to delete customer:', err);
      throw err instanceof Error ? err : new Error(
        err.message === 'Cannot delete customer with existing bookings'
          ? err.message
          : 'Failed to delete customer'
      );
    }
  };

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refresh: loadCustomers
  };
}