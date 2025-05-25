import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Props {
  data: any;
}

export default function BookingReport({ data }: Props) {
  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-blue-600">Total Bookings</h4>
          <p className="text-2xl font-bold mt-2">{data.totalBookings}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-green-600">Delivered</h4>
          <p className="text-2xl font-bold mt-2">{data.delivered}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-yellow-600">In Transit</h4>
          <p className="text-2xl font-bold mt-2">{data.inTransit}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-purple-600">Total Revenue</h4>
          <p className="text-2xl font-bold mt-2">₹{data.totalRevenue}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-6">Booking Trends</h4>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar name="Bookings" dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar name="Delivered" dataKey="delivered" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Booking Details</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">LR Number</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Date</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">From</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">To</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Status</th>
                <th className="text-right text-sm font-medium text-gray-600 px-6 py-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.bookings.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-blue-600">{booking.lr_number}</td>
                  <td className="px-6 py-4">{new Date(booking.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{booking.from_branch?.name}</td>
                  <td className="px-6 py-4">{booking.to_branch?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'in_transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">₹{booking.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}