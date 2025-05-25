import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Truck, MapPin, Calendar, User, Loader2, Search, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LRSelectionList from './LRSelectionList';
import { useVehicles } from '@/hooks/useVehicles';
import { useBranches } from '@/hooks/useBranches';
import { Combobox } from '@/components/ui/combobox';
import type { ComboboxOption } from '@/components/ui/combobox';

const formSchema = z.object({
  transitMode: z.enum(['direct', 'hub', 'local']),
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  vehicleType: z.enum(['all', 'hire', 'own', 'attached']),
  
  // Transit Details
  name: z.string().min(1, 'Name is required'),
  routes: z.string().min(1, 'Route is required'),
  transitDate: z.string().min(1, 'Transit date is required'),
  fromStation: z.string().min(1, 'From station is required'),
  toStation: z.string().min(1, 'To station is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  arrivalTime: z.string().min(1, 'Arrival time is required'),
  remarks: z.string().optional(),

  // Via Stations
  viaStations: z.array(z.string()).optional(),
  hubLoadStations: z.array(z.string()).optional(),
  localTransitStation: z.string().optional(),

  // Supervisor Details
  supervisorName: z.string().min(1, 'Supervisor name is required'),
  supervisorMobile: z.string().min(10, 'Valid mobile number required'),
  primaryDriverName: z.string().min(1, 'Primary driver name is required'),
  primaryDriverMobile: z.string().min(10, 'Valid mobile number required'),
  secondaryDriverName: z.string().optional(),
  secondaryDriverMobile: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  organizationId: string;
  onSubmit: (data: FormValues) => Promise<void>;
  onClose: () => void;
}

export default function LoadingForm({ organizationId, onSubmit, onClose }: Props) {
  const [showLRList, setShowLRList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLRs, setSelectedLRs] = useState<string[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState('');

  const { vehicles, loading: loadingVehicles } = useVehicles(organizationId);
  const { branches } = useBranches(organizationId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transitMode: 'direct',
      vehicleType: 'all',
      viaStations: [],
      hubLoadStations: [],
      transitDate: new Date().toISOString().split('T')[0],
      departureTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
      arrivalTime: new Date(Date.now() + 3600000).toTimeString().split(' ')[0].substring(0, 5),
    },
    mode: 'onChange',
  });

  const transitMode = watch('transitMode');
  const vehicleType = watch('vehicleType');
  const selectedVehicleId = watch('vehicleNumber');

  // Filter vehicles based on search and type
  const filteredVehicles = React.useMemo(() => {
    if (!vehicles) return [];
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.vehicle_number.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                           `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(vehicleSearch.toLowerCase());
      const matchesType = vehicleType === 'all' || vehicle.type === vehicleType;
      return matchesSearch && matchesType;
    });
  }, [vehicles, vehicleSearch, vehicleType]);

  // Convert vehicles to combobox options
  const vehicleOptions: ComboboxOption[] = filteredVehicles.map(vehicle => ({
    value: vehicle.id,
    label: vehicle.vehicle_number,
    description: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
    icon: Truck,
    details: {
      type: vehicle.type
    }
  }));

  // Get selected vehicle details
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const handleGetOGPL = () => {
    setShowLRList(true);
  };

  const handleLoadLRs = (lrs: string[]) => {
    setSelectedLRs(lrs);
    setShowLRList(false);
  };

  const handleFormSubmit = async (data: FormValues) => {
    if (selectedLRs.length === 0) {
      alert('Please select LRs to load');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...data,
        selectedLRs
      } as any);
      onClose();
    } catch (err) {
      console.error('Failed to create loading sheet:', err);
      alert('Failed to create loading sheet. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Mode Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Mode of Transit</h3>
        <RadioGroup
          value={transitMode}
          onValueChange={(value: 'direct' | 'hub' | 'local') => {
            setValue('transitMode', value);
          }}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="direct" id="direct" />
            <Label htmlFor="direct">Direct Load</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hub" id="hub" />
            <Label htmlFor="hub">Hub Load</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="local" id="local" />
            <Label htmlFor="local">Local Transit</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Vehicle Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Vehicle</h3>
            <p className="text-sm text-gray-600 mt-1">Select vehicle for transit</p>
          </div>
          <div className="flex gap-2">
            {['All', 'Own', 'Hired', 'Attached'].map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className={vehicleType === type.toLowerCase() ? 'bg-blue-50 text-blue-600' : ''}
                onClick={() => setValue('vehicleType', type.toLowerCase() as any)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <Label>Select Vehicle</Label>
              <Combobox
                options={vehicleOptions}
                value={selectedVehicleId}
                onValueChange={(value) => setValue('vehicleNumber', value)}
                placeholder="Search and select a vehicle..."
                searchPlaceholder="Type to search vehicles..."
                onSearchChange={setVehicleSearch}
                className="mt-1"
              />
              {errors.vehicleNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.vehicleNumber.message}</p>
              )}
              
              {selectedVehicle && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedVehicle.vehicle_number}</h4>
                      <p className="text-sm text-gray-600">{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {selectedVehicle.type}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedVehicle.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : selectedVehicle.status === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedVehicle.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button type="button" onClick={handleGetOGPL} disabled={!selectedVehicleId}>
              Get OGPL
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Transit Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transit Details</h3>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input {...register('name')} placeholder="OGPL Name" />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label>Transit Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  {...register('transitDate')}
                  type="date"
                  className="pl-10"
                />
              </div>
              {errors.transitDate && (
                <p className="text-sm text-red-500 mt-1">{errors.transitDate.message}</p>
              )}
            </div>

            <div>
              <Label>From Station</Label>
              <Select
                value={watch('fromStation')}
                onValueChange={(value) => setValue('fromStation', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select from station" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fromStation && (
                <p className="text-sm text-red-500 mt-1">{errors.fromStation.message}</p>
              )}
            </div>

            <div>
              <Label>To Station</Label>
              <Select
                value={watch('toStation')}
                onValueChange={(value) => setValue('toStation', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select to station" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toStation && (
                <p className="text-sm text-red-500 mt-1">{errors.toStation.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Departure Time</Label>
                <Input
                  {...register('departureTime')}
                  type="time"
                />
                {errors.departureTime && (
                  <p className="text-sm text-red-500 mt-1">{errors.departureTime.message}</p>
                )}
              </div>
              <div>
                <Label>Arrival Time</Label>
                <Input
                  {...register('arrivalTime')}
                  type="time"
                />
                {errors.arrivalTime && (
                  <p className="text-sm text-red-500 mt-1">{errors.arrivalTime.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Remarks</Label>
              <Input
                {...register('remarks')}
                placeholder="Optional remarks"
              />
            </div>
          </div>
        </div>

        {/* Supervisor Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Supervisor & Driver Details</h3>
          <div className="space-y-4">
            <div>
              <Label>Supervisor Name</Label>
              <Input
                {...register('supervisorName')}
                placeholder="Enter supervisor name"
              />
              {errors.supervisorName && (
                <p className="text-sm text-red-500 mt-1">{errors.supervisorName.message}</p>
              )}
            </div>

            <div>
              <Label>Supervisor Mobile</Label>
              <Input
                {...register('supervisorMobile')}
                placeholder="Enter supervisor mobile"
              />
              {errors.supervisorMobile && (
                <p className="text-sm text-red-500 mt-1">{errors.supervisorMobile.message}</p>
              )}
            </div>

            <div>
              <Label>Primary Driver Name</Label>
              <Input
                {...register('primaryDriverName')}
                placeholder="Enter driver name"
              />
              {errors.primaryDriverName && (
                <p className="text-sm text-red-500 mt-1">{errors.primaryDriverName.message}</p>
              )}
            </div>

            <div>
              <Label>Primary Driver Mobile</Label>
              <Input
                {...register('primaryDriverMobile')}
                placeholder="Enter driver mobile"
              />
              {errors.primaryDriverMobile && (
                <p className="text-sm text-red-500 mt-1">{errors.primaryDriverMobile.message}</p>
              )}
            </div>

            <div>
              <Label>Secondary Driver Name (Optional)</Label>
              <Input
                {...register('secondaryDriverName')}
                placeholder="Enter secondary driver name"
              />
            </div>

            <div>
              <Label>Secondary Driver Mobile (Optional)</Label>
              <Input
                {...register('secondaryDriverMobile')}
                placeholder="Enter secondary driver mobile"
              />
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Route Details</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Via Stations</Label>
                <Button variant="outline" size="sm" type="button">
                  Add Via Station
                </Button>
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select via stations" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {transitMode === 'hub' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Hub Load Stations</Label>
                  <Button variant="outline" size="sm" type="button">
                    Add Hub Station
                  </Button>
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hub stations" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} - {branch.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {transitMode === 'local' && (
              <div>
                <Label>Local Transit Station</Label>
                <Select
                  value={watch('localTransitStation')}
                  onValueChange={(value) => setValue('localTransitStation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select local station" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} - {branch.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Selected LRs</Label>
              {selectedLRs.length > 0 ? (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {selectedLRs.length} LRs selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setShowLRList(true)}
                    >
                      Change Selection
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Click "Get OGPL" to modify selection
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg text-center">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowLRList(true)}
                    className="w-full"
                    disabled={!selectedVehicleId}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Select LRs
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting || !isValid || selectedLRs.length === 0}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating Loading Sheet...
            </>
          ) : (
            'Create Loading Sheet'
          )}
        </Button>
      </div>

      {showLRList && (
        <LRSelectionList
          organizationId={organizationId}
          onClose={() => setShowLRList(false)}
          onLoad={handleLoadLRs}
          selectedLRs={selectedLRs}
        />
      )}
    </form>
  );
}