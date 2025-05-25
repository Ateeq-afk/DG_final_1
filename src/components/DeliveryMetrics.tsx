import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useOrganizations } from '@/hooks/useOrganizations';

function DeliveryMetrics() {
  const { organizations } = useOrganizations();
  const organizationId = organizations[0]?.id;
  const { bookings } = useBookings(organizationId);

  // Calculate metrics
  const metrics = React.useMemo(() => {
    if (!bookings.length) return {
      pieData: [],
      successRate: 0,
      successRateChange: 0,
      avgDelay: 0,
      avgDelayChange: 0
    };

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Current period metrics
    const currentBookings = bookings.filter(b => new Date(b.created_at) >= lastMonth);
    const currentDelivered = currentBookings.filter(b => b.status === 'delivered').length;
    const currentTotal = currentBookings.length;
    const currentSuccessRate = currentTotal ? (currentDelivered / currentTotal) * 100 : 0;

    // Previous period metrics
    const previousBookings = bookings.filter(b => {
      const date = new Date(b.created_at);
      return date >= new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, lastMonth.getDate()) &&
             date < lastMonth;
    });
    const previousDelivered = previousBookings.filter(b => b.status === 'delivered').length;
    const previousTotal = previousBookings.length;
    const previousSuccessRate = previousTotal ? (previousDelivered / previousTotal) * 100 : 0;

    // Calculate changes
    const successRateChange = previousSuccessRate ? ((currentSuccessRate - previousSuccessRate) / previousSuccessRate) * 100 : 0;

    // Status distribution for pie chart
    const statusCounts = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value
    }));

    return {
      pieData,
      successRate: currentSuccessRate,
      successRateChange,
      avgDelay: 18, // TODO: Calculate actual delay when we have delivery timestamps
      avgDelayChange: -5.1
    };
  }, [bookings]);

  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Status</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={metrics.pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {metrics.pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry, index) => (
                <span className="text-sm font-medium text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <MetricCard
          label="Success Rate"
          value={`${metrics.successRate.toFixed(1)}%`}
          trend={`${metrics.successRateChange >= 0 ? '+' : ''}${metrics.successRateChange.toFixed(1)}%`}
          trendUp={metrics.successRateChange >= 0}
        />
        <MetricCard
          label="Avg. Delay"
          value={`${metrics.avgDelay} min`}
          trend={`${metrics.avgDelayChange}%`}
          trendUp={metrics.avgDelayChange < 0}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, trendUp }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50">
      <p className="text-sm text-gray-600">{label}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xl font-semibold text-gray-900">{value}</p>
        <div className={`flex items-center text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          <span className="ml-1">{trend}</span>
        </div>
      </div>
    </div>
  );
}

export default DeliveryMetrics;