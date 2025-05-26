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

      // For demo purposes, we'll create mock data
      const mockOGPLs = Array.from({ length: 5 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Random date in the last 7 days
        
        return {
          id: `ogpl-${i + 1}`,
          organization_id: organizationId,
          ogpl_number: `OGPL-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${(i + 1).toString().padStart(4, '0')}`,
          name: `Transit ${i + 1}`,
          vehicle_id: `vehicle${i % 3 + 1}`,
          transit_mode: ['direct', 'hub', 'local'][i % 3],
          transit_date: date.toISOString().split('T')[0],
          from_station: 'branch1',
          to_station: `branch${i % 3 + 2}`,
          departure_time: '08:00',
          arrival_time: '18:00',
          supervisor_name: `Supervisor ${i + 1}`,
          supervisor_mobile: `98765${(43210 + i).toString().padStart(5, '0')}`,
          primary_driver_name: `Driver ${i + 1}`,
          primary_driver_mobile: `98765${(12345 + i).toString().padStart(5, '0')}`,
          status: 'in_transit',
          created_at: date.toISOString(),
          updated_at: date.toISOString(),
          // Mock related data
          vehicle: {
            id: `vehicle${i % 3 + 1}`,
            vehicle_number: ['MH01AB1234', 'DL01CD5678', 'KA01EF9012'][i % 3],
            type: ['own', 'hired', 'attached'][i % 3],
            make: ['Tata', 'Mahindra', 'Eicher'][i % 3],
            model: ['Ace', 'Bolero', 'Pro 2049'][i % 3],
            year: 2022 - (i % 3),
            status: 'active',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          from_station_details: {
            id: 'branch1',
            name: 'Mumbai HQ',
            code: 'MUM-HQ',
            city: 'Mumbai',
            state: 'Maharashtra',
            is_head_office: true,
            status: 'active',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          to_station_details: {
            id: `branch${i % 3 + 2}`,
            name: ['Delhi Branch', 'Bangalore Branch', 'Chennai Branch'][i % 3],
            code: ['DEL-01', 'BLR-01', 'CHN-01'][i % 3],
            city: ['Delhi', 'Bangalore', 'Chennai'][i % 3],
            state: ['Delhi', 'Karnataka', 'Tamil Nadu'][i % 3],
            is_head_office: false,
            status: 'active',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          loading_records: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, j) => {
            return {
              id: `loading-${i}-${j}`,
              ogpl_id: `ogpl-${i + 1}`,
              booking_id: `booking-${i * 10 + j + 1}`,
              loaded_at: date.toISOString(),
              loaded_by: 'user1',
              remarks: Math.random() > 0.7 ? `Handle with care. Item ${j + 1}.` : null,
              created_at: date.toISOString(),
              updated_at: date.toISOString(),
              booking: {
                id: `booking-${i * 10 + j + 1}`,
                lr_number: `LR-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${(i * 10 + j + 1).toString().padStart(4, '0')}`,
                article_id: `article${j % 5 + 1}`,
                quantity: Math.floor(Math.random() * 10) + 1,
                uom: ['Fixed', 'KG', 'Pieces', 'Boxes', 'Bundles'][j % 5],
                status: 'in_transit',
                created_at: date.toISOString(),
                updated_at: date.toISOString(),
                sender: {
                  id: `sender${j % 5 + 1}`,
                  name: `Sender ${j % 5 + 1}`,
                  mobile: `98765${(43210 + j).toString().padStart(5, '0')}`,
                  type: Math.random() > 0.5 ? 'individual' : 'company',
                  created_at: date.toISOString(),
                  updated_at: date.toISOString()
                },
                receiver: {
                  id: `receiver${j % 5 + 1}`,
                  name: `Receiver ${j % 5 + 1}`,
                  mobile: `98765${(12345 + j).toString().padStart(5, '0')}`,
                  type: Math.random() > 0.5 ? 'individual' : 'company',
                  created_at: date.toISOString(),
                  updated_at: date.toISOString()
                },
                article: {
                  id: `article${j % 5 + 1}`,
                  name: ['Cloth Bundle', 'Cloth Box', 'Garments', 'Fabric Rolls', 'Textile Machinery'][j % 5],
                  description: ['Standard cloth bundles', 'Boxed cloth materials', 'Ready-made garments', 'Rolled fabric materials', 'Textile manufacturing equipment'][j % 5],
                  base_rate: Math.floor(Math.random() * 200) + 50,
                  created_at: date.toISOString(),
                  updated_at: date.toISOString()
                }
              }
            };
          })
        };
      });
      
      return mockOGPLs;
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

      // In a real implementation, this would create an unloading record in the database
      // For demo purposes, we'll simulate a successful unloading
      const unloadingRecord = {
        id: `unloading-${Date.now()}`,
        ogpl_id: ogplId,
        unloaded_at: new Date().toISOString(),
        unloaded_by: 'user1', // This would be the current user's ID
        conditions
      };
      
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

      // For demo purposes, we'll create mock data
      const mockUnloadings = Array.from({ length: 3 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i - 1); // Past few days
        
        const ogpl = {
          id: `ogpl-${i + 10}`,
          organization_id: organizationId,
          ogpl_number: `OGPL-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${(i + 10).toString().padStart(4, '0')}`,
          name: `Completed Transit ${i + 1}`,
          vehicle_id: `vehicle${i % 3 + 1}`,
          transit_mode: ['direct', 'hub', 'local'][i % 3],
          transit_date: date.toISOString().split('T')[0],
          from_station: 'branch1',
          to_station: `branch${i % 3 + 2}`,
          departure_time: '08:00',
          arrival_time: '18:00',
          supervisor_name: `Supervisor ${i + 1}`,
          supervisor_mobile: `98765${(43210 + i).toString().padStart(5, '0')}`,
          primary_driver_name: `Driver ${i + 1}`,
          primary_driver_mobile: `98765${(12345 + i).toString().padStart(5, '0')}`,
          status: 'completed',
          created_at: date.toISOString(),
          updated_at: date.toISOString(),
          // Mock related data
          vehicle: {
            id: `vehicle${i % 3 + 1}`,
            vehicle_number: ['MH01AB1234', 'DL01CD5678', 'KA01EF9012'][i % 3],
            type: ['own', 'hired', 'attached'][i % 3],
            make: ['Tata', 'Mahindra', 'Eicher'][i % 3],
            model: ['Ace', 'Bolero', 'Pro 2049'][i % 3],
            year: 2022 - (i % 3),
            status: 'active',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          from_station_details: {
            id: 'branch1',
            name: 'Mumbai HQ',
            code: 'MUM-HQ',
            city: 'Mumbai',
            state: 'Maharashtra',
            is_head_office: true,
            status: 'active',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          to_station_details: {
            id: `branch${i % 3 + 2}`,
            name: ['Delhi Branch', 'Bangalore Branch', 'Chennai Branch'][i % 3],
            code: ['DEL-01', 'BLR-01', 'CHN-01'][i % 3],
            city: ['Delhi', 'Bangalore', 'Chennai'][i % 3],
            state: ['Delhi', 'Karnataka', 'Tamil Nadu'][i % 3],
            is_head_office: false,
            status: 'active',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          },
          loading_records: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, j) => {
            return {
              id: `loading-${i}-${j}`,
              ogpl_id: `ogpl-${i + 10}`,
              booking_id: `booking-${i * 10 + j + 1}`,
              loaded_at: date.toISOString(),
              loaded_by: 'user1',
              remarks: Math.random() > 0.7 ? `Handle with care. Item ${j + 1}.` : null,
              created_at: date.toISOString(),
              updated_at: date.toISOString(),
              booking: {
                id: `booking-${i * 10 + j + 1}`,
                lr_number: `LR-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${(i * 10 + j + 1).toString().padStart(4, '0')}`,
                article_id: `article${j % 5 + 1}`,
                quantity: Math.floor(Math.random() * 10) + 1,
                uom: ['Fixed', 'KG', 'Pieces', 'Boxes', 'Bundles'][j % 5],
                status: 'delivered',
                created_at: date.toISOString(),
                updated_at: date.toISOString(),
                sender: {
                  id: `sender${j % 5 + 1}`,
                  name: `Sender ${j % 5 + 1}`,
                  mobile: `98765${(43210 + j).toString().padStart(5, '0')}`,
                  type: Math.random() > 0.5 ? 'individual' : 'company',
                  created_at: date.toISOString(),
                  updated_at: date.toISOString()
                },
                receiver: {
                  id: `receiver${j % 5 + 1}`,
                  name: `Receiver ${j % 5 + 1}`,
                  mobile: `98765${(12345 + j).toString().padStart(5, '0')}`,
                  type: Math.random() > 0.5 ? 'individual' : 'company',
                  created_at: date.toISOString(),
                  updated_at: date.toISOString()
                },
                article: {
                  id: `article${j % 5 + 1}`,
                  name: ['Cloth Bundle', 'Cloth Box', 'Garments', 'Fabric Rolls', 'Textile Machinery'][j % 5],
                  description: ['Standard cloth bundles', 'Boxed cloth materials', 'Ready-made garments', 'Rolled fabric materials', 'Textile manufacturing equipment'][j % 5],
                  base_rate: Math.floor(Math.random() * 200) + 50,
                  created_at: date.toISOString(),
                  updated_at: date.toISOString()
                }
              }
            };
          })
        };
        
        // Generate conditions for each booking
        const conditions: Record<string, { status: string; remarks?: string; photo?: string }> = {};
        ogpl.loading_records.forEach(record => {
          const status = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'damaged' : 'missing') : 'good';
          conditions[record.booking_id] = {
            status,
            remarks: status !== 'good' ? `Issue with ${record.booking.article.name}` : undefined,
            photo: status === 'damaged' && Math.random() > 0.5 ? 'https://via.placeholder.com/300' : undefined
          };
        });
        
        return {
          id: `unloading-${i + 1}`,
          ogpl_id: `ogpl-${i + 10}`,
          unloaded_at: date.toISOString(),
          unloaded_by: 'user1',
          conditions,
          created_at: date.toISOString(),
          ogpl
        };
      });
      
      return mockUnloadings;
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