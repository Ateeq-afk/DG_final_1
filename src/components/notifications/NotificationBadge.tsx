import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/lib/notifications';

interface NotificationBadgeProps {
  onClick: () => void;
}

export default function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications();
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="relative rounded-xl h-10 w-10 border-gray-200"
      onClick={onClick}
    >
      <Bell className="h-5 w-5 text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
}