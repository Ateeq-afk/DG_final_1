import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Download, 
  Printer, 
  Package, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpDown,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOGPL } from '@/hooks/useOGPL';
import { useOrganizations } from '@/hooks/useOrganizations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function LoadingList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'vehicle' | 'lrCount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOGPL, setSelectedOGPL] = useState<string | null>(null);
  
  const { organizations } = useOrganizations();
  const organizationId = organizations[0]?.id;
  const { getOGPLs, getOGPLDetails, loading, error } = useOGPL(organizationId);
  const [ogpls, setOGPLs] = useState<any[]>([]);
  const [ogplDetails, setOGPLDetails] = useState<any | null>(null);
  const itemsPerPage = 10;
  
  useEffect(() => {
    if (organizationId) {
      loadOGPLs();
    }
  }, [organizationId]);
  
  const loadOGPLs = async () => {
    try {
      const data = await getOGPLs();
      setOGPLs(data || []);
    } catch (err) {
      console.error('Failed to load OGPLs:', err);
    }
  };
  
  const loadOGPLDetails = async (ogplId: string) => {
    try {
      const data = await getOGPLDetails(ogplId);
      setOGPLDetails(data);
    } catch (err) {
      console.error('Failed to load OGPL details:', err);
    }
  };
  
  // Filter OGPLs based on search and filters
  const filteredOGPLs = React.useMemo(() => {
    return ogpls.filter(ogpl => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchLower === '' || 
        ogpl.ogpl_number.toLowerCase().includes(searchLower) ||
        ogpl.vehicle?.vehicle_number.toLowerCase().includes(searchLower) ||
        ogpl.from_station?.name.toLowerCase().includes(searchLower) ||
        ogpl.to_station?.name.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter !== 'all' && ogpl.status !== statusFilter) return false;

      // Vehicle filter
      if (vehicleFilter !== 'all' && ogpl.vehicle?.type !== vehicleFilter) return false;

      // Date filter
      if (dateFilter !== 'all') {
        const ogplDate = new Date(ogpl.created_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        switch (dateFilter) {
          case 'today':
            if (ogplDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'yesterday':
            if (ogplDate.toDateString() !== yesterday.toDateString()) return false;
            break;
          case 'last_week':
            if (ogplDate < lastWeek) return false;
            break;
          case 'last_month':
            if (ogplDate < lastMonth) return false;
            break;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sorting
      if (sortField === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortField === 'vehicle') {
        return sortDirection === 'asc'
          ? a.vehicle?.vehicle_number.localeCompare(b.vehicle?.vehicle_number)
          : b.vehicle?.vehicle_number.localeCompare(a.vehicle?.vehicle_number);
      } else if (sortField === 'lrCount') {
        return sortDirection === 'asc'
          ? (a.loading_records?.length || 0) - (b.loading_records?.length || 0)
          : (b.loading_records?.length || 0) - (a.loading_records?.length || 0);
      }
      return 0;
    });
  }, [ogpls, searchQuery, statusFilter, vehicleFilter, dateFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredOGPLs.length / itemsPerPage);
  const paginatedOGPLs = filteredOGPLs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: 'date' | 'vehicle' | 'lrCount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleViewDetails = (ogplId: string) => {
    setSelectedOGPL(ogplId);
    loadOGPLDetails(ogplId);
  };

  const handlePrintOGPL = (ogplId: string) => {
    // In a real implementation, this would generate a PDF
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Failed to load data</h3>
        <p className="text-red-600 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loading Sheets</h2>
          <p className="text-gray-600 mt-1">
            Manage and track all your OGPL (Outward Gate Pass cum Loading Sheet)
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search by OGPL number or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="own">Own</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="attached">Attached</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">OGPL No</th>
                <th 
                  className="text-left text-sm font-medium text-gray-600 px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                    {sortField === 'date' && (
                      <ArrowUpDown className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="text-left text-sm font-medium text-gray-600 px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('vehicle')}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Vehicle
                    {sortField === 'vehicle' && (
                      <ArrowUpDown className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">From</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">To</th>
                <th 
                  className="text-left text-sm font-medium text-gray-600 px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('lrCount')}
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    LRs
                    {sortField === 'lrCount' && (
                      <ArrowUpDown className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Status</th>
                <th className="text-right text-sm font-medium text-gray-600 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOGPLs.map((ogpl) => (
                <tr key={ogpl.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-medium">{ogpl.ogpl_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(ogpl.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{ogpl.vehicle?.vehicle_number}</div>
                        <div className="text-sm text-gray-500 capitalize">{ogpl.vehicle?.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{ogpl.from_station?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{ogpl.to_station?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span>{ogpl.loading_records?.length || 0} LRs</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      ogpl.status === 'completed' ? 'success' :
                      ogpl.status === 'in_transit' ? 'info' :
                      ogpl.status === 'cancelled' ? 'destructive' :
                      'secondary'
                    }>
                      {ogpl.status === 'in_transit' ? 'In Transit' : 
                       ogpl.status.charAt(0).toUpperCase() + ogpl.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(ogpl.id)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintOGPL(ogpl.id)}
                        className="flex items-center gap-1"
                      >
                        <Printer className="h-4 w-4" />
                        <span className="hidden sm:inline">Print</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedOGPLs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No loading sheets found</h3>
                    <p className="text-gray-500 mt-1">
                      {searchQuery || dateFilter !== 'all' || statusFilter !== 'all' || vehicleFilter !== 'all'
                        ? 'Try adjusting your filters to see more results'
                        : 'Create your first loading sheet to get started'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredOGPLs.length)}
              </span>{' '}
              of <span className="font-medium">{filteredOGPLs.length}</span> loading sheets
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="hidden md:inline-flex"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* OGPL Details Dialog */}
      <Dialog 
        open={!!selectedOGPL} 
        onOpenChange={(open) => {
          if (!open) setSelectedOGPL(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading Sheet Details</DialogTitle>
          </DialogHeader>
          {ogplDetails && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">OGPL #{ogplDetails.ogpl_number}</h2>
                    <p className="text-gray-600">{new Date(ogplDetails.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <Badge variant={
                  ogplDetails.status === 'completed' ? 'success' :
                  ogplDetails.status === 'in_transit' ? 'info' :
                  ogplDetails.status === 'cancelled' ? 'destructive' :
                  'secondary'
                }>
                  {ogplDetails.status === 'in_transit' ? 'In Transit' : 
                   ogplDetails.status.charAt(0).toUpperCase() + ogplDetails.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Number</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{ogplDetails.vehicle?.vehicle_number}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Type</p>
                      <p className="font-medium text-gray-900 capitalize">{ogplDetails.vehicle?.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Driver</p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{ogplDetails.primary_driver_name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Driver Mobile</p>
                      <p className="font-medium text-gray-900">{ogplDetails.primary_driver_mobile}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Route Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">From</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{ogplDetails.from_station?.name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">To</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{ogplDetails.to_station?.name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transit Date</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{ogplDetails.transit_date}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transit Mode</p>
                      <p className="font-medium text-gray-900 capitalize">{ogplDetails.transit_mode}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Loaded LRs</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {ogplDetails.loading_records?.length || 0} LRs loaded
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">LR Number</th>
                        <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Article</th>
                        <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Quantity</th>
                        <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Sender</th>
                        <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Receiver</th>
                        <th className="text-right text-sm font-medium text-gray-600 px-6 py-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ogplDetails.loading_records?.map((record: any) => {
                        const booking = record.booking;
                        if (!booking) return null;
                        
                        return (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-blue-600">{booking.lr_number}</td>
                            <td className="px-6 py-4">{booking.article?.name || 'N/A'}</td>
                            <td className="px-6 py-4">{booking.quantity} {booking.uom}</td>
                            <td className="px-6 py-4">
                              <div className="font-medium">{booking.sender?.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{booking.sender?.mobile || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium">{booking.receiver?.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{booking.receiver?.mobile || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 text-right font-medium">
                              ₹{booking.total_amount?.toFixed(2) || '0.00'}
                            </td>
                          </tr>
                        );
                      })}

                      {(!ogplDetails.loading_records || ogplDetails.loading_records.length === 0) && (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No LRs found</h3>
                            <p className="text-gray-500 mt-1">This loading sheet has no LRs</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedOGPL(null)}>
                  Close
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print OGPL
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}