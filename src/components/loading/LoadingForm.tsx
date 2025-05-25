import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Truck, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  User, 
  Search, 
  Plus, 
  Trash, 
  Loader2, 
  CheckCircle2,
  Package,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBranches } from '@/hooks/useBranches';
import { useVehicles } from '@/hooks/useVehicles';
import { useBookings } from '@/hooks/useBookings';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z.object({
  fromBranchId: z.string().min(1, 'Source branch is required'),
  toBranchId: z.string().min(1, 'Destination branch is required'),
  transitDate: z.string().min(1, 'Transit date is required'),
  transitMode: z.enum(['direct', 'hub', 'local']),
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  vehicleType: z.enum(['own', 'hired', 'attached']),
  driverName: z.string().min(1, 'Driver name is required'),
  driverMobile: z.string().min(10, 'Valid mobile number required'),
  remarks: z.string().optional(),
  selectedLRs: z.array(z.string()).min(1, 'At least one LR is required')
});

type FormValues = z.infer<typeof formSchema>;

export default function LoadingForm({ organizationId, onSubmit, onClose }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showLRList, setShowLRList] = useState(false);
  const [selectedLRs, setSelectedLRs] = useState<string[]>([]);
  
  const { branches } = useBranches();
  const { vehicles } = useVehicles();
  const { bookings } = useBookings();
  const { showSuccess, showError } = useNotificationSystem();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    control
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transitDate: new Date().toISOString().split('T')[0],
      transitMode: 'direct',
      vehicleType: 'own',
      selectedLRs: []
    }
  });
  
  const watchFromBranch = watch('fromBranchId');
  
  // Filter branches for destination (exclude source branch)
  const destinationBranches = branches.filter(branch => branch.id !== watchFromBranch);
  
  // Filter bookings for LR selection
  const availableBookings = bookings.filter(booking => 
    booking.status === 'booked' && 
    booking.from_branch === watchFromBranch
  );
  
  useEffect(() => {
    // Update selectedLRs in form when changed
    setValue('selectedLRs', selectedLRs);
  }, [selectedLRs, setValue]);
  
  const handleLRSelection = (lrs: string[]) => {
    setSelectedLRs(lrs);
    setShowLRList(false);
  };
  
  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };
  
  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };
  
  const onFormSubmit = async (data: FormValues) => {
    if (selectedLRs.length === 0) {
      showError('Selection Required', 'Please select LRs to load');
      return;
    }

    try {
      setSubmitting(true);
      
      // In a real implementation, this would create an OGPL
      console.log('Creating OGPL with data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      showSuccess('OGPL Created', 'Loading sheet has been created successfully');
      
      // Reset form after success
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setSelectedLRs([]);
      }, 3000);
    } catch (err) {
      console.error('Failed to create OGPL:', err);
      showError('OGPL Creation Failed', 'Failed to create loading sheet');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-green-50 rounded-full"></div>
              </div>
              <div className="relative z-10">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="h-32 w-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </motion.div>
              </div>
            </div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Loading Sheet Created Successfully
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-600 mb-8 max-w-md mx-auto"
            >
              Your loading sheet has been created and is now ready for use. Drivers and handlers can now access the loading details.
            </motion.p>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                variant="outline" 
                className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={onClose}
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Loading Sheet</h2>
          <p className="text-gray-600 mt-1">
            Create a new OGPL (Outward Gate Pass cum Loading Sheet)
          </p>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2 relative">
          <div className="absolute left-4 right-4 top-1/2 h-1 bg-gray-200 -z-10"></div>
          <div className="flex-1 flex items-center justify-center">
            <motion.div 
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              } z-10`}
              initial={false}
              animate={{ 
                scale: step === 1 ? 1.1 : 1,
                boxShadow: step === 1 ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none'
              }}
            >
              1
            </motion.div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <motion.div 
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              } z-10`}
              initial={false}
              animate={{ 
                scale: step === 2 ? 1.1 : 1,
                boxShadow: step === 2 ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none'
              }}
            >
              2
            </motion.div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <motion.div 
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              } z-10`}
              initial={false}
              animate={{ 
                scale: step === 3 ? 1.1 : 1,
                boxShadow: step === 3 ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none'
              }}
            >
              3
            </motion.div>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <div className="flex-1 text-center">
            <span className={step === 1 ? 'font-medium text-blue-600' : ''}>Basic Info</span>
          </div>
          <div className="flex-1 text-center">
            <span className={step === 2 ? 'font-medium text-blue-600' : ''}>Vehicle Details</span>
          </div>
          <div className="flex-1 text-center">
            <span className={step === 3 ? 'font-medium text-blue-600' : ''}>LR Selection</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Route Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>From Branch</Label>
                  <Select
                    value={watchFromBranch}
                    onValueChange={(value) => setValue('fromBranchId', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select source branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} - {branch.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fromBranchId && (
                    <p className="text-sm text-red-500 mt-1">{errors.fromBranchId.message}</p>
                  )}
                </div>
                
                <div>
                  <Label>To Branch</Label>
                  <Select
                    value={watch('toBranchId')}
                    onValueChange={(value) => setValue('toBranchId', value)}
                    disabled={!watchFromBranch}
                  >
                    <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select destination branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} - {branch.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.toBranchId && (
                    <p className="text-sm text-red-500 mt-1">{errors.toBranchId.message}</p>
                  )}
                </div>
                
                <div>
                  <Label>Transit Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      {...register('transitDate')}
                      className="pl-10 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {errors.transitDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.transitDate.message}</p>
                  )}
                </div>
                
                <div>
                  <Label>Transit Mode</Label>
                  <Select
                    value={watch('transitMode')}
                    onValueChange={(value: 'direct' | 'hub' | 'local') => setValue('transitMode', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select transit mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Load</SelectItem>
                      <SelectItem value="hub">Hub Load</SelectItem>
                      <SelectItem value="local">Local Transit</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.transitMode && (
                    <p className="text-sm text-red-500 mt-1">{errors.transitMode.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label>Remarks (Optional)</Label>
                  <Input
                    {...register('remarks')}
                    placeholder="Enter any additional remarks"
                    className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    Next: Vehicle Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {/* Step 2: Vehicle Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Vehicle & Driver Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Vehicle Type</Label>
                  <Select
                    value={watch('vehicleType')}
                    onValueChange={(value: 'own' | 'hired' | 'attached') => setValue('vehicleType', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own">Own</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="attached">Attached</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.vehicleType && (
                    <p className="text-sm text-red-500 mt-1">{errors.vehicleType.message}</p>
                  )}
                </div>
                
                <div>
                  <Label>Vehicle Number</Label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      {...register('vehicleNumber')}
                      placeholder="Enter vehicle number"
                      className="pl-10 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 uppercase"
                    />
                  </div>
                  {errors.vehicleNumber && (
                    <p className="text-sm text-red-500 mt-1">{errors.vehicleNumber.message}</p>
                  )}
                </div>
                
                <div>
                  <Label>Driver Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      {...register('driverName')}
                      placeholder="Enter driver name"
                      className="pl-10 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {errors.driverName && (
                    <p className="text-sm text-red-500 mt-1">{errors.driverName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label>Driver Mobile</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      {...register('driverMobile')}
                      placeholder="Enter driver mobile"
                      className="pl-10 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {errors.driverMobile && (
                    <p className="text-sm text-red-500 mt-1">{errors.driverMobile.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    Next: Select LRs
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {/* Step 3: LR Selection */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Select LRs for Loading</h3>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base font-medium">Selected LRs</Label>
                    <p className="text-sm text-gray-500">
                      {selectedLRs.length} LRs selected for loading
                    </p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => setShowLRList(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Select LRs
                    </Button>
                  </motion.div>
                </div>
                
                {selectedLRs.length > 0 ? (
                  <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">
                        {selectedLRs.length} LRs selected
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setShowLRList(true)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        Change Selection
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedLRs.slice(0, 5).map((lrId) => {
                        const booking = bookings.find(b => b.id === lrId);
                        return booking ? (
                          <div key={lrId} className="bg-white px-3 py-1.5 rounded-full text-sm border border-blue-200 flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium">{booking.lr_number}</span>
                          </div>
                        ) : null;
                      })}
                      {selectedLRs.length > 5 && (
                        <div className="bg-white px-3 py-1.5 rounded-full text-sm border border-blue-200">
                          +{selectedLRs.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900">No LRs Selected</h4>
                    <p className="text-gray-500 mt-1 mb-4">Select LRs to include in this loading sheet</p>
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setShowLRList(true)}
                      className="mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Select LRs
                    </Button>
                  </div>
                )}
                
                {errors.selectedLRs && (
                  <p className="text-sm text-red-500 mt-2">{errors.selectedLRs.message}</p>
                )}
              </div>
              
              <div className="flex justify-between mt-6">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    disabled={submitting || selectedLRs.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating OGPL...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Create Loading Sheet
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      
      {/* LR Selection Modal */}
      {showLRList && (
        <LRSelectionList
          bookings={availableBookings}
          selectedLRs={selectedLRs}
          onLoad={handleLRSelection}
          onClose={() => setShowLRList(false)}
        />
      )}
    </div>
  );
}

interface LRSelectionListProps {
  bookings: any[];
  selectedLRs: string[];
  onLoad: (lrIds: string[]) => void;
  onClose: () => void;
}

function LRSelectionList({ bookings, selectedLRs, onLoad, onClose }: LRSelectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelection, setLocalSelection] = useState<string[]>(selectedLRs);
  
  // Filter bookings based on search
  const filteredBookings = bookings.filter(booking => 
    booking.lr_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.sender?.name && booking.sender.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (booking.receiver?.name && booking.receiver.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleSelectAll = () => {
    if (localSelection.length === filteredBookings.length) {
      setLocalSelection([]);
    } else {
      setLocalSelection(filteredBookings.map(b => b.id));
    }
  };
  
  const toggleSelection = (id: string) => {
    setLocalSelection(prev => 
      prev.includes(id) 
        ? prev.filter(lrId => lrId !== id) 
        : [...prev, id]
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-2xl w-[95%] max-w-7xl h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select LRs to Load</h2>
                <p className="text-gray-600 text-sm">Choose which LRs to include in this loading sheet</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-full h-8 w-8 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                className="pl-10 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by LR number, sender, or receiver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleSelectAll}
              className="whitespace-nowrap"
            >
              {localSelection.length === filteredBookings.length && filteredBookings.length > 0 
                ? 'Deselect All' 
                : 'Select All'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={localSelection.length === filteredBookings.length && filteredBookings.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">LR No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">From</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">To</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sender</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Receiver</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Article</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <motion.tr 
                      key={booking.id} 
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                        localSelection.includes(booking.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => toggleSelection(booking.id)}
                      whileHover={{ backgroundColor: 'rgba(239, 246, 255, 0.6)' }}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={localSelection.includes(booking.id)}
                          onChange={() => toggleSelection(booking.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{booking.lr_number}</td>
                      <td className="px-4 py-3 text-sm">{booking.from_branch_details?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{booking.to_branch_details?.name || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{booking.sender?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{booking.sender?.mobile || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{booking.receiver?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{booking.receiver?.mobile || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{booking.article?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">₹{booking.total_amount?.toFixed(2) || '0.00'}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center py-12">
                        <Package className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
                        <p className="text-gray-500 max-w-md">
                          {searchQuery 
                            ? 'No bookings match your search criteria. Try adjusting your search terms.'
                            : 'There are no bookings available for loading at this time.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">{localSelection.length}</span> LRs selected
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => onLoad(localSelection)}
                  disabled={localSelection.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Load Selected
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper component for Phone icon
function Phone(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function X(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}