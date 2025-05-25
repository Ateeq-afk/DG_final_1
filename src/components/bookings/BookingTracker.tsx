import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  Search,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBookings } from '@/hooks/useBookings';
import { motion } from 'framer-motion';
import type { Booking } from '@/types';

interface BookingTrackerProps {
  initialLrNumber?: string;
}

export default function BookingTracker({ initialLrNumber }: BookingTrackerProps) {
  const [lrNumber, setLrNumber] = useState(initialLrNumber || '');
  const [searching, setSearching] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { bookings } = useBookings();
  
  // If initialLrNumber is provided, search for it on mount
  useEffect(() => {
    if (initialLrNumber) {
      handleSearch();
    }
  }, [initialLrNumber]);
  
  const handleSearch = async () => {
    if (!lrNumber.trim()) {
      setError('Please enter an LR number');
      return;
    }
    
    try {
      setSearching(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      // For demo purposes, we'll search the local bookings array
      const foundBooking = bookings.find(b => b.lr_number === lrNumber.trim());
      
      if (foundBooking) {
        setBooking(foundBooking);
      } else {
        setError('Booking not found. Please check the LR number and try again.');
        setBooking(null);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('An error occurred while searching. Please try again.');
      setBooking(null);
    } finally {
      setSearching(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_transit':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-yellow-600" />;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Track Your Shipment</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Enter LR Number"
            value={lrNumber}
            onChange={(e) => setLrNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={searching || !lrNumber.trim()}
          className="min-w-[120px]"
        >
          {searching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </>
          ) : (
            'Track'
          )}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {booking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Booking Status Card */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">LR #{booking.lr_number}</h3>
                  <p className="text-gray-600">
                    Booked on {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                <span className="font-medium capitalize">
                  {booking.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Shipment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Route Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900">Route Information</h3>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-medium text-gray-900">{booking.from_branch_details?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{booking.from_branch_details?.city}, {booking.from_branch_details?.state}</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">To</p>
                  <p className="font-medium text-gray-900">{booking.to_branch_details?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{booking.to_branch_details?.city}, {booking.to_branch_details?.state}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Expected Delivery</p>
                  <p className="font-medium text-gray-900">{booking.expected_delivery_date || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <p className="font-medium text-gray-900">{booking.priority || 'Normal'}</p>
                </div>
              </div>
            </div>
            
            {/* Article Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Article Details</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Article Type</p>
                    <p className="font-medium text-gray-900">{booking.article?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-medium text-gray-900">{booking.quantity} {booking.uom}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Actual Weight</p>
                    <p className="font-medium text-gray-900">{booking.actual_weight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-medium text-gray-900">{booking.description || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tracking Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Shipment Tracking</h3>
            </div>
            
            <div className="relative pb-12">
              {/* Timeline */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Booked Status */}
              <div className="relative flex items-start gap-4 mb-8">
                <div className="absolute left-4 w-0.5 h-full bg-gray-200"></div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center z-10">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-medium text-gray-900">Booking Created</h4>
                  <p className="text-sm text-gray-500">{new Date(booking.created_at).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Booking created at {booking.from_branch_details?.name}
                  </p>
                </div>
              </div>
              
              {/* In Transit Status */}
              <div className="relative flex items-start gap-4 mb-8">
                <div className={`h-8 w-8 rounded-full ${
                  booking.status === 'in_transit' || booking.status === 'delivered'
                    ? 'bg-green-100'
                    : booking.status === 'cancelled'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                } flex items-center justify-center z-10`}>
                  {booking.status === 'in_transit' || booking.status === 'delivered' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : booking.status === 'cancelled' ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-medium text-gray-900">In Transit</h4>
                  {booking.status === 'in_transit' || booking.status === 'delivered' ? (
                    <>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.updated_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Shipment in transit from {booking.from_branch_details?.name} to {booking.to_branch_details?.name}
                      </p>
                    </>
                  ) : booking.status === 'cancelled' ? (
                    <p className="text-sm text-red-500">Booking was cancelled</p>
                  ) : (
                    <p className="text-sm text-gray-500">Pending</p>
                  )}
                </div>
              </div>
              
              {/* Delivered Status */}
              <div className="relative flex items-start gap-4">
                <div className={`h-8 w-8 rounded-full ${
                  booking.status === 'delivered'
                    ? 'bg-green-100'
                    : booking.status === 'cancelled'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                } flex items-center justify-center z-10`}>
                  {booking.status === 'delivered' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : booking.status === 'cancelled' ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-medium text-gray-900">Delivered</h4>
                  {booking.status === 'delivered' ? (
                    <>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.updated_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Shipment delivered at {booking.to_branch_details?.name}
                      </p>
                    </>
                  ) : booking.status === 'cancelled' ? (
                    <p className="text-sm text-red-500">Booking was cancelled</p>
                  ) : (
                    <p className="text-sm text-gray-500">Pending</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">Sender Information</h3>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{booking.sender?.name || 'N/A'}</p>
                <p className="text-gray-600">📱 {booking.sender?.mobile || 'N/A'}</p>
                {booking.sender?.gst && <p className="text-gray-600">GST: {booking.sender.gst}</p>}
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">Receiver Information</h3>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{booking.receiver?.name || 'N/A'}</p>
                <p className="text-gray-600">📱 {booking.receiver?.mobile || 'N/A'}</p>
                {booking.receiver?.gst && <p className="text-gray-600">GST: {booking.receiver.gst}</p>}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {!booking && !error && !searching && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Track Your Shipment</h3>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            Enter your LR number above to track your shipment and get real-time updates on its status.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper component for User icon
function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}