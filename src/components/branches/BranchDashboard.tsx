import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Package, 
  Truck, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search,
  Filter,
  Download,
  ChevronRight,
  Plus,
  FileText,
  BarChart3,
  Printer,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { IndianRupee } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBookings } from '@/hooks/useBookings';
import { useVehicles } from '@/hooks/useVehicles';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { motion } from 'framer-motion';

export default function BranchDashboard() {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('last_month');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  const { branches } = useBranches();
  const { bookings } = useBookings(selectedBranch);
  const { vehicles } = useVehicles(selectedBranch);
  const { customers } = useCustomers(selectedBranch);
  const { getCurrentUserBranch } = useAuth();
  const navigate = useNavigate();
  
  const userBranch = getCurrentUserBranch();
  
  // Set user's branch as default selected branch
  useEffect(() => {
    if (userBranch && !selectedBranch) {
      setSelectedBranch(userBranch.id);
    } else if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0].id);
    }
  }, [userBranch, branches, selectedBranch]);
  
  // Get current branch details
  const currentBranch = branches.find(branch => branch.id === selectedBranch);
  
  // Calculate branch statistics
  const branchStats = React.useMemo(() => {
    if (!bookings.length) return {
      totalBookings: 0,
      revenue: 0,
      inboundBookings: 0,
      outboundBookings: 0,
      pendingDeliveries: 0,
      activeVehicles: 0
    };
    
    const totalBookings = bookings.length;
    const revenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const inboundBookings = bookings.filter(b => b.to_branch === selectedBranch).length;
    const outboundBookings = bookings.filter(b => b.from_branch === selectedBranch).length;
    const pendingDeliveries = bookings.filter(b => 
      b.to_branch === selectedBranch && 
      (b.status === 'booked' || b.status === 'in_transit')
    ).length;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    
    return {
      totalBookings,
      revenue,
      inboundBookings,
      outboundBookings,
      pendingDeliveries,
      activeVehicles
    };
  }, [bookings, vehicles, selectedBranch]);
  
  // Generate booking trend data
  const bookingTrends = React.useMemo(() => {
    const dailyData = {};
    
    // Get last 30 days
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = {
        date: dateStr,
        inbound: 0,
        outbound: 0
      };
    }
    
    // Fill in booking data
    bookings.forEach(booking => {
      const date = new Date(booking.created_at).toISOString().split('T')[0];
      if (dailyData[date]) {
        if (booking.to_branch === selectedBranch) {
          dailyData[date].inbound++;
        }
        if (booking.from_branch === selectedBranch) {
          dailyData[date].outbound++;
        }
      }
    });
    
    return Object.values(dailyData);
  }, [bookings, selectedBranch]);
  
  // Generate status distribution data
  const statusDistribution = React.useMemo(() => {
    const statuses = {
      'booked': 0,
      'in_transit': 0,
      'delivered': 0,
      'cancelled': 0
    };
    
    bookings.forEach(booking => {
      statuses[booking.status] = (statuses[booking.status] || 0) + 1;
    });
    
    return Object.entries(statuses).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value
    }));
  }, [bookings]);
  
  // Generate top customers data
  const topCustomers = React.useMemo(() => {
    const customerBookings = {};
    
    bookings.forEach(booking => {
      // Count both senders and receivers
      if (booking.sender_id) {
        customerBookings[booking.sender_id] = (customerBookings[booking.sender_id] || 0) + 1;
      }
      if (booking.receiver_id) {
        customerBookings[booking.receiver_id] = (customerBookings[booking.receiver_id] || 0) + 1;
      }
    });
    
    // Convert to array and sort
    const sortedCustomers = Object.entries(customerBookings)
      .map(([id, count]) => {
        const customer = customers.find(c => c.id === id);
        return {
          id,
          name: customer?.name || 'Unknown',
          count: count as number,
          type: customer?.type || 'unknown'
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return sortedCustomers;
  }, [bookings, customers]);
  
  // Colors for charts
  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  // Handle branch change
  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
  };
  
  // Navigation handlers
  const handleCreateBooking = () => {
    navigate('/dashboard/new-booking');
  };
  
  const handleViewBookings = () => {
    navigate('/dashboard/bookings');
  };
  
  const handleManageVehicles = () => {
    navigate('/dashboard/vehicles');
  };
  
  const handleManageCustomers = () => {
    navigate('/dashboard/customers');
  };
  
  if (!currentBranch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Branch Selected</h3>
          <p className="text-gray-600 mt-1">Please select a branch to view its dashboard</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Branch Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Manage operations for your branch
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedBranch} onValueChange={handleBranchChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name} - {branch.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Branch Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{currentBranch.name}</h3>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <MapPin className="h-4 w-4" />
                <span>{currentBranch.city}, {currentBranch.state}</span>
                {currentBranch.is_head_office && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Head Office
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Phone</span>
              </div>
              <p className="font-medium">{currentBranch.phone}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Email</span>
              </div>
              <p className="font-medium">{currentBranch.email}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Status</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                currentBranch.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : currentBranch.status === 'maintenance'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentBranch.status.charAt(0).toUpperCase() + currentBranch.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleCreateBooking}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Create Booking</h3>
              <p className="text-sm text-gray-500">Create a new LR</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleViewBookings}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">View Bookings</h3>
              <p className="text-sm text-gray-500">Manage all bookings</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleManageVehicles}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Manage Vehicles</h3>
              <p className="text-sm text-gray-500">View fleet status</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleManageCustomers}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Manage Customers</h3>
              <p className="text-sm text-gray-500">View customer list</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <StatCard
          title="Total Bookings"
          value={branchStats.totalBookings.toString()}
          icon={Package}
          color="blue"
          trend={{ value: "+12%", isUp: true }}
        />
        
        <StatCard
          title="Revenue"
          value={`₹${(branchStats.revenue / 1000).toFixed(1)}K`}
          icon={IndianRupee}
          color="green"
          trend={{ value: "+8.5%", isUp: true }}
        />
        
        <StatCard
          title="Inbound"
          value={branchStats.inboundBookings.toString()}
          icon={ArrowDownRight}
          color="purple"
          trend={{ value: "+15%", isUp: true }}
        />
        
        <StatCard
          title="Outbound"
          value={branchStats.outboundBookings.toString()}
          icon={ArrowUpRight}
          color="amber"
          trend={{ value: "+10%", isUp: true }}
        />
        
        <StatCard
          title="Pending Deliveries"
          value={branchStats.pendingDeliveries.toString()}
          icon={Clock}
          color="red"
          trend={{ value: "-5%", isUp: false }}
        />
        
        <StatCard
          title="Active Vehicles"
          value={`${branchStats.activeVehicles}/${vehicles.length}`}
          icon={Truck}
          color="indigo"
          trend={{ value: "+2", isUp: true }}
        />
      </motion.div>
      
      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Booking Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Booking Trends</h3>
                <p className="text-sm text-gray-500 mt-1">Inbound vs Outbound bookings</p>
              </div>
              <Select defaultValue="last_month">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_week">Last 7 Days</SelectItem>
                  <SelectItem value="last_month">Last 30 Days</SelectItem>
                  <SelectItem value="last_quarter">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      });
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [value, '']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    }}
                  />
                  <Legend />
                  <Bar 
                    name="Outbound" 
                    dataKey="outbound" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={8}
                  />
                  <Bar 
                    name="Inbound" 
                    dataKey="inbound" 
                    fill="#8b5cf6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
          
          {/* Status Distribution & Top Customers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
                  <p className="text-sm text-gray-500 mt-1">Distribution by status</p>
                </div>
              </div>
              <div className="h-[250px]">
                {statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Bookings']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Top Customers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
                  <p className="text-sm text-gray-500 mt-1">Most active customers</p>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" />
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {topCustomers.length > 0 ? (
                  topCustomers.map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          customer.type === 'individual' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{customer.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {customer.count} bookings
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No customer data available</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                <p className="text-sm text-gray-500 mt-1">Latest booking activity</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleViewBookings}
              >
                <ChevronRight className="h-4 w-4" />
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 rounded-lg">
                    <th className="text-left text-sm font-medium text-gray-600 px-4 py-3 rounded-l-lg">LR Number</th>
                    <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Date</th>
                    <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">From/To</th>
                    <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Customer</th>
                    <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Status</th>
                    <th className="text-right text-sm font-medium text-gray-600 px-4 py-3 rounded-r-lg">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-blue-600">{booking.lr_number}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.from_branch === selectedBranch 
                          ? <span className="flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-green-600" /> {booking.to_branch_details?.name}</span>
                          : <span className="flex items-center gap-1"><ArrowDownRight className="h-3 w-3 text-blue-600" /> {booking.from_branch_details?.name}</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.from_branch === selectedBranch 
                          ? booking.sender?.name
                          : booking.receiver?.name
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'in_transit'
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status.replace('_', ' ').charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium">₹{booking.total_amount}</span>
                      </td>
                    </tr>
                  ))}
                  
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                        <p className="text-gray-500 mt-1">No bookings available for this branch</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">On-Time Delivery</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Delivery Success Rate</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Average Delivery Time</span>
                    <span className="text-sm font-medium">36 hours</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Operational Efficiency</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Vehicle Utilization</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Staff Productivity</span>
                    <span className="text-sm font-medium">88%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Cost Efficiency</span>
                    <span className="text-sm font-medium">82%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Overall Rating</span>
                    <span className="text-sm font-medium">4.8/5.0</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Issue Resolution</span>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Repeat Customers</span>
                    <span className="text-sm font-medium">82%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Performance Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Branch Performance Comparison</h3>
                <p className="text-sm text-gray-500 mt-1">How this branch compares to others</p>
              </div>
              <Select defaultValue="bookings">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="delivery">Delivery Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Mumbai HQ', value: 120 },
                    { name: 'Delhi Branch', value: 98 },
                    { name: 'Bangalore Branch', value: 86 },
                    { name: currentBranch.name, value: 105 },
                    { name: 'Chennai Branch', value: 90 }
                  ]}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip formatter={(value) => [value, 'Bookings']} />
                  <Bar 
                    dataKey="value" 
                    fill={(entry) => entry.name === currentBranch.name ? '#3b82f6' : '#94a3b8'}
                    name="Bookings"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-6">
          {/* Branch Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Staff */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Staff</h3>
                  <p className="text-sm text-gray-500 mt-1">Branch personnel</p>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Staff
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Rajesh Kumar</p>
                      <p className="text-sm text-gray-500">Branch Manager</p>
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Active
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Priya Sharma</p>
                      <p className="text-sm text-gray-500">Operations Manager</p>
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Active
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Amit Patel</p>
                      <p className="text-sm text-gray-500">Booking Operator</p>
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Active
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" className="w-full">
                  View All Staff
                </Button>
              </div>
            </motion.div>
            
            {/* Vehicles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Vehicles</h3>
                  <p className="text-sm text-gray-500 mt-1">Branch fleet</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleManageVehicles}
                >
                  <ChevronRight className="h-4 w-4" />
                  Manage Fleet
                </Button>
              </div>
              <div className="space-y-4">
                {vehicles.slice(0, 3).map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Truck className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{vehicle.vehicle_number}</p>
                        <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model}</p>
                      </div>
                    </div>
                    <div className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      vehicle.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : vehicle.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                    </div>
                  </div>
                ))}
                
                {vehicles.length === 0 && (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
                    <p className="text-gray-500 mt-1">No vehicles assigned to this branch</p>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" className="w-full">
                  View All Vehicles
                </Button>
              </div>
            </motion.div>
          </div>
          
          {/* Inventory & Equipment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Inventory & Equipment</h3>
                <p className="text-sm text-gray-500 mt-1">Branch resources</p>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Item</th>
                    <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Category</th>
                    <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Quantity</th>
                    <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Status</th>
                    <th className="text-right text-sm font-medium text-gray-600 px-4 py-3">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Packaging Materials</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Supplies</td>
                    <td className="px-4 py-3 text-sm text-gray-600">250 units</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        In Stock
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {new Date().toLocaleDateString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Hand Trucks</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Equipment</td>
                    <td className="px-4 py-3 text-sm text-gray-600">8 units</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        In Stock
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {new Date().toLocaleDateString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Weighing Scales</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Equipment</td>
                    <td className="px-4 py-3 text-sm text-gray-600">5 units</td>
                    <td className="px-4 py-3">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Low Stock
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {new Date().toLocaleDateString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Pallet Jacks</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Equipment</td>
                    <td className="px-4 py-3 text-sm text-gray-600">3 units</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        In Stock
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {new Date().toLocaleDateString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'indigo';
  trend?: {
    value: string;
    isUp: boolean;
  };
}

function StatCard({ icon: Icon, title, value, color, trend }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span className="text-xs font-medium">{trend.value}</span>
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-900">{value}</h3>
      <p className="text-xs text-gray-600">{title}</p>
    </div>
  );
}