import React, { useState } from 'react';
import { Package, ChevronRight, Filter } from 'lucide-react';

function RecentDeliveries() {
  const [filter, setFilter] = useState('all');
  
  const deliveries = [
    {
      id: 1,
      orderNumber: "ORD-2024-001",
      customer: "Priya Sharma",
      location: "Mumbai, MH",
      status: "In Transit",
      amount: "₹2,450",
      time: "10 mins ago"
    },
    {
      id: 2,
      orderNumber: "ORD-2024-002",
      customer: "Amit Patel",
      location: "Bangalore, KA",
      status: "Delivered",
      amount: "₹1,850",
      time: "25 mins ago"
    },
    {
      id: 3,
      orderNumber: "ORD-2024-003",
      customer: "Raj Kumar",
      location: "Delhi, DL",
      status: "Pending",
      amount: "₹3,200",
      time: "45 mins ago"
    },
    {
      id: 4,
      orderNumber: "ORD-2024-004",
      customer: "Sneha Reddy",
      location: "Hyderabad, TS",
      status: "Delivered",
      amount: "₹1,650",
      time: "1 hour ago"
    }
  ];

  const filteredDeliveries = filter === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.status.toLowerCase() === filter);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-50 text-green-600';
      case 'in transit':
        return 'bg-blue-50 text-blue-600';
      case 'pending':
        return 'bg-orange-50 text-orange-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Deliveries</h2>
          <p className="text-gray-600 text-sm mt-1">Monitor your latest delivery orders</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm font-medium text-gray-600 bg-gray-50 border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="in transit">In Transit</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {filteredDeliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{delivery.orderNumber}</p>
                <p className="text-sm text-gray-600">{delivery.customer}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{delivery.amount}</p>
                <p className="text-xs text-gray-600">{delivery.location}</p>
              </div>
              <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(delivery.status)}`}>
                {delivery.status}
              </div>
              <p className="text-sm text-gray-600">{delivery.time}</p>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentDeliveries;