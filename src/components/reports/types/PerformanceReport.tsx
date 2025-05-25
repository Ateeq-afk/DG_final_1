import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface Props {
  data: any;
}

export default function PerformanceReport({ data }: Props) {
  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-blue-600">Success Rate</h4>
          <p className="text-2xl font-bold mt-2">{data.successRate}%</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-green-600">On-Time Rate</h4>
          <p className="text-2xl font-bold mt-2">{data.onTimeRate}%</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-yellow-600">Customer Satisfaction</h4>
          <p className="text-2xl font-bold mt-2">{data.customerSatisfaction}%</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-purple-600">Efficiency Score</h4>
          <p className="text-2xl font-bold mt-2">{data.efficiencyScore}/100</p>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-6">Performance Trends</h4>
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
                name="Success Rate" 
                dataKey="successRate" 
                stroke="#3b82f6" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                name="On-Time Rate" 
                dataKey="onTimeRate" 
                stroke="#22c55e" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6">Performance Metrics</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.metrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6">Areas for Improvement</h4>
          <div className="space-y-4">
            {data.improvements.map((item: any) => (
              <div key={item.area} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.area}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}