import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Filter } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useOrganizations } from '@/hooks/useOrganizations';

function DeliveryChart() {
  const [timeRange, setTimeRange] = useState('This Week');
  const { organizations } = useOrganizations();
  const organizationId = organizations[0]?.id;
  const { bookings } = useBookings(organizationId);

  // Process booking data for chart
  const chartData = React.useMemo(() => {
    if (!bookings.length) return [];

    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'week' | 'month';

    switch (timeRange) {
      case 'Today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        groupBy = 'day';
        break;
      case 'This Week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        groupBy = 'day';
        break;
      case 'This Month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = 'week';
        break;
      case 'This Year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupBy = 'month';
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        groupBy = 'day';
    }

    // Filter bookings by date range
    const filteredBookings = bookings.filter(b => new Date(b.created_at) >= startDate);

    // Group bookings
    const groups = new Map();
    filteredBookings.forEach(booking => {
      const date = new Date(booking.created_at);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toLocaleDateString();
          break;
        case 'week':
          const weekNum = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
          key = `Week ${weekNum}`;
          break;
        case 'month':
          key = date.toLocaleString('default', { month: 'short' });
          break;
      }

      if (!groups.has(key)) {
        groups.set(key, { name: key, successful: 0, failed: 0 });
      }

      const group = groups.get(key);
      if (booking.status === 'delivered') {
        group.successful++;
      } else if (booking.status === 'cancelled') {
        group.failed++;
      }
    });

    return Array.from(groups.values());
  }, [bookings, timeRange]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Delivery Performance</h2>
          <p className="text-gray-600 text-sm mt-1">Track your delivery success rate</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl cursor-pointer">
            <Calendar className="h-4 w-4 text-gray-600" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <button className="p-2 rounded-xl hover:bg-gray-50">
            <Filter className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}
            />
            <Legend />
            <Bar 
              name="Successful" 
              dataKey="successful" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              name="Failed" 
              dataKey="failed" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DeliveryChart;