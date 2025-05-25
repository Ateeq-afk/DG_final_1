import React, { useState } from 'react';
import { Download, Truck, Package, ArrowRight, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingForm from './LoadingForm';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuth } from '@/contexts/AuthContext';
import { useOGPL } from '@/hooks/useOGPL';
import AuthModal from './auth/AuthModal';
import { motion } from 'framer-motion';

export default function LoadingPage() {
  const [showForm, setShowForm] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();
  const { organizations } = useOrganizations();
  const organizationId = organizations[0]?.id;
  const { createOGPL, addLRsToOGPL } = useOGPL(organizationId);

  const handleCreateLoading = async (data: any) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    try {
      // First create the OGPL
      const ogpl = await createOGPL({
        ogpl_number: '',
        name: data.name,
        vehicle_id: data.vehicleNumber,
        transit_mode: data.transitMode,
        route_id: data.routes,
        transit_date: data.transitDate,
        from_station: data.fromStation,
        to_station: data.toStation,
        departure_time: data.departureTime,
        arrival_time: data.arrivalTime,
        supervisor_name: data.supervisorName,
        supervisor_mobile: data.supervisorMobile,
        primary_driver_name: data.primaryDriverName,
        primary_driver_mobile: data.primaryDriverMobile,
        secondary_driver_name: data.secondaryDriverName,
        secondary_driver_mobile: data.secondaryDriverMobile,
        via_stations: data.viaStations,
        hub_load_stations: data.hubLoadStations,
        local_transit_station: data.localTransitStation,
        remarks: data.remarks,
        organization_id: organizationId
      });

      // Then add the selected LRs
      await addLRsToOGPL(ogpl.id, data.selectedLRs);

      setShowForm(false);
    } catch (err) {
      console.error('Failed to create loading sheet:', err);
      alert('Failed to create loading sheet');
    }
  };

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white p-8 rounded-xl shadow-lg border border-blue-100"
        >
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Organization Selected</h3>
          <p className="text-gray-600">Please select or create an organization first</p>
          <Button className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            Select Organization
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Vehicle Loading</h2>
            <p className="text-gray-600 mt-1">Manage vehicle loading operations</p>
          </div>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
            <Download className="h-5 w-5" />
            Export Sheet
          </Button>
        </motion.div>

        {showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <LoadingForm 
              organizationId={organizationId}
              onSubmit={handleCreateLoading}
              onClose={() => setShowForm(false)}
            />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center"
          >
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Sheet Created Successfully</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your loading sheet has been created and is now ready for use. Drivers and handlers can now access the loading details.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                <Download className="h-4 w-4" />
                Download Sheet
              </Button>
              <Button 
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Upload className="h-4 w-4" />
                Create Another
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}