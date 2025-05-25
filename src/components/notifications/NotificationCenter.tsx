import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertTriangle, Info, Package, Truck, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: React.ReactNode;
}

interface NotificationCenterProps {
  onClose: () => void;
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Booking Confirmed',
      message: 'Booking #LR-20250101-0001 has been successfully created',
      time: '5 minutes ago',
      read: false,
      icon: <Package className="h-5 w-5" />
    },
    {
      id: '2',
      type: 'info',
      title: 'Vehicle Assigned',
      message: 'Vehicle MH01AB1234 has been assigned to your booking',
      time: '1 hour ago',
      read: false,
      icon: <Truck className="h-5 w-5" />
    },
    {
      id: '3',
      type: 'warning',
      title: 'Delivery Delayed',
      message: 'Delivery for booking #LR-20250101-0002 has been delayed',
      time: '3 hours ago',
      read: true,
      icon: <Calendar className="h-5 w-5" />
    },
    {
      id: '4',
      type: 'info',
      title: 'New Customer',
      message: 'Textile Hub has been added as a new customer',
      time: '1 day ago',
      read: true,
      icon: <User className="h-5 w-5" />
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getIconByType = (type: string, customIcon?: React.ReactNode) => {
    if (customIcon) return customIcon;
    
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundByType = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Notification panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col"
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`${getBackgroundByType(notification.type)} ${notification.read ? 'opacity-75' : ''} 
                      border rounded-xl p-4 relative transition-all duration-200 hover:shadow-md`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="absolute top-3 right-3 flex gap-1">
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full hover:bg-gray-200/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className={`h-10 w-10 rounded-full ${
                        notification.type === 'success' ? 'bg-green-100' : 
                        notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      } flex items-center justify-center shrink-0`}>
                        {getIconByType(notification.type, notification.icon)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                <p className="text-gray-500 mt-1 max-w-xs">
                  You're all caught up! We'll notify you when something new happens.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}