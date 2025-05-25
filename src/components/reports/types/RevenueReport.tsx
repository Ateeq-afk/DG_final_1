import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Props {
  data: any;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

export default function RevenueReport({ data }: Props) {
  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-blue-600">Total Revenue</h4>
          <p className="text-2xl font-bold mt-2">₹{data.totalRevenue}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-green-600">Growth</h4>
          <p className="text-2xl font-bold mt-2">{data.growth}%</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-yellow-600">Average Order Value</h4>
          <p className="text-2xl font-bold mt-2">₹{data.averageOrderValue}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-purple-600">Outstanding Amount</h4>
          <p className="text-2xl font-bold mt-2">₹{data.outstandingAmount}</p>
        </div>
      </div>

      {/* Revenue Trends */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-6">Revenue Trends</h4>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                name="Revenue"
                dataKey="revenue"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6">Payment Type Distribution</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.paymentDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6">Top Revenue Sources</h4>
          <div className="space-y-4">
            {data.topSources.map((source: any) => (
              <div key={source.name} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{source.name}</p>
                  <p className="text-sm text-gray-500">{source.bookings} bookings</p>
                </div>
                <p className="font-medium text-gray-900">₹{source.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}