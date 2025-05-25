import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Vehicle {
  id: string;
  branch_id: string;
  vehicle_number: string;
  type: 'own' | 'hired' | 'attached';
  make: string;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'inactive';
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useVehicles(branchId: string | null = null) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading vehicles, branchId:', branchId);
      
      // For demo purposes, we'll use mock data
      const mockVehicles: Vehicle[] = [
        {
          id: 'vehicle1',
          branch_id: 'branch1',
          vehicle_number: 'MH01AB1234',
          type: 'own',
          make: 'Tata',
          model: 'Ace',
          year: 2022,
          status: 'active',
          last_maintenance_date: '2023-12-15',
          next_maintenance_date: '2024-03-15',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'vehicle2',
          branch_id: 'branch1',
          vehicle_number: 'MH01CD5678',
          type: 'hired',
          make: 'Mahindra',
          model: 'Bolero Pickup',
          year: 2021,
          status: 'active',
          last_maintenance_date: '2023-11-20',
          next_maintenance_date: '2024-02-20',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'vehicle3',
          branch_id: 'branch2',
          vehicle_number: 'DL01EF9012',
          type: 'own',
          make: 'Ashok Leyland',
          model: 'Dost',
          year: 2023,
          status: 'active',
          last_maintenance_date: '2024-01-10',
          next_maintenance_date: '2024-04-10',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'vehicle4',
          branch_id: 'branch3',
          vehicle_number: 'KA01GH3456',
          type: 'attached',
          make: 'Eicher',
          model: 'Pro 2049',
          year: 2020,
          status: 'maintenance',
          last_maintenance_date: '2024-02-01',
          next_maintenance_date: '2024-05-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // Filter by branch if specified
      const filteredVehicles = branchId 
        ? mockVehicles.filter(v => v.branch_id === branchId)
        : mockVehicles;
      
      setVehicles(filteredVehicles);
      console.log('Vehicles loaded:', filteredVehicles.length);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      setError(err instanceof Error ? err : new Error('Failed to load vehicles'));
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  async function createVehicle(vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log('Creating vehicle:', vehicleData);
      
      // For demo purposes, we'll create a mock vehicle
      const mockVehicle: Vehicle = {
        id: Math.random().toString(36).substring(2, 15),
        ...vehicleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setVehicles(prev => [mockVehicle, ...prev]);
      console.log('Vehicle created successfully:', mockVehicle);
      return mockVehicle;
    } catch (err) {
      console.error('Failed to create vehicle:', err);
      throw err instanceof Error ? err : new Error('Failed to create vehicle');
    }
  }

  async function updateVehicle(id: string, updates: Partial<Vehicle>) {
    try {
      console.log(`Updating vehicle ${id}:`, updates);
      
      // For demo purposes, we'll update the local state
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === id 
          ? { ...vehicle, ...updates, updated_at: new Date().toISOString() } 
          : vehicle
      ));
      
      const updatedVehicle = vehicles.find(v => v.id === id);
      if (!updatedVehicle) throw new Error('Vehicle not found');
      
      console.log('Vehicle updated successfully:', { ...updatedVehicle, ...updates });
      return { ...updatedVehicle, ...updates };
    } catch (err) {
      console.error('Failed to update vehicle:', err);
      throw err instanceof Error ? err : new Error('Failed to update vehicle');
    }
  }

  async function deleteVehicle(id: string) {
    try {
      console.log(`Deleting vehicle ${id}`);
      
      // For demo purposes, we'll update the local state
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      console.log('Vehicle deleted successfully');
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
      throw err instanceof Error ? err : new Error('Failed to delete vehicle');
    }
  }

  async function updateVehicleStatus(id: string, status: 'active' | 'maintenance' | 'inactive') {
    try {
      return await updateVehicle(id, { status });
    } catch (err) {
      console.error('Failed to update vehicle status:', err);
      throw err instanceof Error ? err : new Error('Failed to update vehicle status');
    }
  }

  return {
    vehicles,
    loading,
    error,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    updateVehicleStatus,
    refresh: loadVehicles
  };
}