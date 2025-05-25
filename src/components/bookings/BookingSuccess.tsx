import React from 'react';
import { CheckCircle2, Printer, Download, Copy, Share2, X, Receipt, ArrowRight, Calendar, Package, MapPin, User, Clock, AlertTriangle, Shield } from 'lucide-react';
import { IndianRupee } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { Booking } from '@/types';

interface Props {
  booking: Booking;
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

export default function BookingSuccess({ booking, onClose, onPrint, onDownload }: Props) {
  const handleCopyLRNumber = () => {
    navigator.clipboard.writeText(booking.lr_number);
  };

  // Early return if booking data is not available
  if (!booking) {
    return null;
  }

  // Safely access nested properties
  const fromBranch = booking.from_branch_details?.name || 'N/A';
  const toBranch = booking.to_branch_details?.name || 'N/A';
  const senderName = booking.sender?.name || 'N/A';
  const senderMobile = booking.sender?.mobile || 'N/A';
  const receiverName = booking.receiver?.name || 'N/A';
  const receiverMobile = booking.receiver?.mobile || 'N/A';
  const articleName = booking.article?.name || 'N/A';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl max-w-4xl w-full mx-4 p-8 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex justify-center mb-4"
          >
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Created Successfully!</h2>
          <div className="mt-4 inline-flex items-center justify-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
            <span className="text-gray-600">LR Number:</span>
            <code className="bg-white px-3 py-1 rounded-lg font-mono text-blue-600 border border-blue-100">
              {booking.lr_number}
            </code>
            <Button variant="ghost" size="icon" onClick={handleCopyLRNumber} title="Copy LR Number" className="h-7 w-7 rounded-full">
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Booking Status Card */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Booking Status</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Booked
                  </span>
                  <span className="text-sm text-blue-700">
                    {new Date(booking.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 bg-blue-50">
                <MapPin className="h-4 w-4 mr-1" />
                Track Shipment
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                <p className="font-medium text-gray-900">{fromBranch}</p>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">To</p>
                <p className="font-medium text-gray-900">{toBranch}</p>
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
          
          {/* Customer Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Customer Information</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Sender</p>
                <p className="font-medium text-gray-900">{senderName}</p>
                <p className="text-sm text-gray-600">{senderMobile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Receiver</p>
                <p className="font-medium text-gray-900">{receiverName}</p>
                <p className="text-sm text-gray-600">{receiverMobile}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  <p className="font-medium text-gray-900">{articleName}</p>
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
              
              {(booking.fragile || booking.insurance_required) && (
                <div className="grid grid-cols-2 gap-4">
                  {booking.fragile && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">Fragile Item</span>
                    </div>
                  )}
                  {booking.insurance_required && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">Insured</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Payment Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Payment Details</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Payment Type</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  booking.payment_type === 'Paid' 
                    ? 'bg-green-100 text-green-800' 
                    : booking.payment_type === 'To Pay'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {booking.payment_type}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Freight Charges</p>
                <p className="font-medium">₹{(booking.quantity * booking.freight_per_qty).toFixed(2)}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Additional Charges</p>
                <p className="font-medium">₹{(booking.loading_charges + booking.unloading_charges).toFixed(2)}</p>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <p className="font-medium text-gray-900">Total Amount</p>
                <p className="font-bold text-lg text-blue-600">₹{booking.total_amount}</p>
              </div>
            </div>
          </div>
        </div>

        {booking.has_invoice && (
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Invoice Details</h3>
                <p className="text-sm text-gray-600">Invoice information for this booking</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">E-Way Bill Number</p>
                <p className="font-medium">{booking.eway_bill_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="font-medium">{booking.invoice_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Invoice Amount</p>
                <p className="font-medium">₹{booking.invoice_amount?.toFixed(2) || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Invoice Date</p>
                <p className="font-medium">{booking.invoice_date || '-'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={onPrint}
            >
              <Printer className="h-5 w-5" />
              Print LR
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={onDownload}
            >
              <Download className="h-5 w-5" />
              Download LR
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Share2 className="h-5 w-5" />
              Share LR
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={onClose} 
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              Create Another Booking
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}