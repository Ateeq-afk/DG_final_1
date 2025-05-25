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
  LineChart,
  Line
} from 'recharts';

interface Props {
  data: any;
}

export default function DeliveryReport({ data }: Props) {
  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-green-600">On-Time Deliveries</h4>
          <p className="text-2xl font-bold mt-2">{data.onTimeDeliveries}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-yellow-600">Delayed</h4>
          <p className="text-2xl font-bold mt-2">{data.delayedDeliveries}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-blue-600">Average Time</h4>
          <p className="text-2xl font-bold mt-2">{data.averageDeliveryTime}h</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-purple-600">Success Rate</h4>
          <p className="text-2xl font-bold mt-2">{data.successRate}%</p>
        </div>
      </div>

      {/* Delivery Time Trends */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-6">Delivery Time Trends</h4>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                name="Average Time (hours)" 
                dataKey="avgTime" 
                stroke="#3b82f6" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Delivery Details</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">LR Number</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Delivery Date</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Time Taken</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Status</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Receiver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.deliveries.map((delivery: any) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-blue-600">{delivery.lr_number}</td>
                  <td className="px-6 py-4">{delivery.delivery_date}</td>
                  <td className="px-6 py-4">{delivery.time_taken} hours</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      delivery.on_time
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.on_time ? 'On Time' : 'Delayed'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{delivery.receiver_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}