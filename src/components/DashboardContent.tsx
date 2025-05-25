import React from 'react';
import { Package, Truck, Download, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function DashboardContent() {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Welcome to K2K Logistics Management System
          </p>
        </div>
      </div>

      {/* Quick Actions - 4 Square Boxes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <QuickActionCard
          icon={Package}
          title="New Booking"
          description="Create a new LR"
          color="blue"
          onClick={() => handleNavigate('/dashboard/new-booking')}
        />
        
        <QuickActionCard
          icon={Upload}
          title="Load"
          description="Create loading sheet"
          color="green"
          onClick={() => handleNavigate('/dashboard/loading')}
        />
        
        <QuickActionCard
          icon={Download}
          title="Unload"
          description="Process unloading"
          color="amber"
          onClick={() => handleNavigate('/dashboard/unloading')}
        />
        
        <QuickActionCard
          icon={CheckCircle2}
          title="Deliver"
          description="Mark as delivered"
          color="purple"
          onClick={() => handleNavigate('/dashboard/bookings')}
        />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-brand-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900">New Booking Created</h4>
                  <span className="text-sm text-gray-500">{i * 10} mins ago</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Booking #{2025000 + i} has been created for customer ABC Enterprises
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button variant="outline" className="hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200">
            View All Activity
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'indigo' | 'rose';
  onClick: () => void;
}

function QuickActionCard({ icon: Icon, title, description, color, onClick }: QuickActionCardProps) {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-100',
      border: 'border-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      hover: 'hover:bg-green-100',
      border: 'border-green-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      hover: 'hover:bg-amber-100',
      border: 'border-amber-100'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-100',
      border: 'border-purple-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      hover: 'hover:bg-indigo-100',
      border: 'border-indigo-100'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      hover: 'hover:bg-rose-100',
      border: 'border-rose-100'
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-xl shadow-sm border ${colors[color].border} p-6 cursor-pointer hover:shadow-md transition-all ${colors[color].hover}`}
      onClick={onClick}
    >
      <div className={`p-4 rounded-xl ${colors[color].bg} mb-4 w-16 h-16 flex items-center justify-center`}>
        <Icon className={`h-8 w-8 ${colors[color].text}`} />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </motion.div>
  );
}