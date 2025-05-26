import React, { useState } from 'react';
import { 
  Truck, 
  Package, 
  BarChart3, 
  Users,
  LayoutDashboard,
  Home,
  LogOut,
  FileText,
  IndianRupee,
  Building2,
  Upload,
  Download,
  ChevronRight,
  Settings,
  Menu,
  ChevronDown
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface NavItemProps {
  icon: React.ElementType;
  text: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
  children?: React.ReactNode;
}

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

function Sidebar({ onNavigate, currentPage }: SidebarProps) {
  const navigate = useNavigate();
  const { userData, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    overview: false,
    operations: false,
    management: false,
    finance: false,
    settings: false
  });

  const handleNavigate = (path: string) => {
    navigate(`/dashboard/${path}`);
    onNavigate(path);
  };

  const toggleCollapse = (section: string) => {
    setCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Check user role for permissions
  const isAdmin = userData?.role === 'admin';
  const isBranchManager = userData?.role === 'branch_manager';
  const isAccountant = userData?.role === 'accountant';
  const isStaff = userData?.role === 'staff';

  return (
    <aside className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white shadow-md">
          <Truck className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-800 text-transparent bg-clip-text">
            DesiCargo
          </span>
          <span className="text-xs text-gray-500">K2K Logistics</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-hidden">
        {/* Quick Actions */}
        <div className="px-3 py-2 bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl border border-brand-100 shadow-sm">
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="transition-all duration-200"
          >
            <NavItem 
              icon={Package} 
              text="New Booking" 
              active={currentPage === 'new-booking'}
              onClick={() => handleNavigate('new-booking')}
            />
          </motion.div>
        </div>

        {/* Overview */}
        <NavGroup 
          title="OVERVIEW" 
          defaultOpen={true}
          onToggle={() => toggleCollapse('overview')}
          isCollapsed={collapsed.overview}
        >
          <NavItem 
            icon={Home} 
            text="Dashboard" 
            active={currentPage === '' || currentPage === 'dashboard'}
            onClick={() => handleNavigate('')}
          />
        </NavGroup>
        
        {/* Operations */}
        <NavGroup 
          title="OPERATIONS" 
          defaultOpen={true}
          onToggle={() => toggleCollapse('operations')}
          isCollapsed={collapsed.operations}
        >
          <NavItem 
            icon={Package} 
            text="Bookings" 
            active={currentPage === 'bookings'}
            onClick={() => handleNavigate('bookings')}
            badge={3}
          />
          {(isAdmin || isBranchManager) && (
            <>
              <NavItem 
                icon={Upload} 
                text="Loading" 
                active={currentPage === 'loading'}
                onClick={() => handleNavigate('loading')}
              />
              <NavItem 
                icon={Download} 
                text="Unloading" 
                active={currentPage === 'unloading'}
                onClick={() => handleNavigate('unloading')}
              />
            </>
          )}
          <NavItem 
            icon={Layers2} 
            text="Articles" 
            active={currentPage === 'articles'}
            onClick={() => handleNavigate('articles')}
          />
        </NavGroup>

        {/* Management - Admin and Branch Manager only */}
        {(isAdmin || isBranchManager) && (
          <NavGroup 
            title="MANAGEMENT" 
            defaultOpen={true}
            onToggle={() => toggleCollapse('management')}
            isCollapsed={collapsed.management}
          >
            <NavItem 
              icon={Users} 
              text="Customers"
              active={currentPage === 'customers'}
              onClick={() => handleNavigate('customers')}
            />
            <NavItem 
              icon={Truck} 
              text="Vehicles"
              active={currentPage === 'vehicles'}
              onClick={() => handleNavigate('vehicles')}
            />
            {isAdmin && (
              <NavItem 
                icon={Building2} 
                text="Branches"
                active={currentPage === 'branches'}
                onClick={() => handleNavigate('branches')}
              />
            )}
          </NavGroup>
        )}

        {/* Finance - Admin and Accountant only */}
        {(isAdmin || isAccountant) && (
          <NavGroup 
            title="FINANCE" 
            defaultOpen={true}
            onToggle={() => toggleCollapse('finance')}
            isCollapsed={collapsed.finance}
          >
            <NavItem 
              icon={IndianRupee} 
              text="Revenue"
              active={currentPage === 'revenue'}
              onClick={() => handleNavigate('revenue')}
            />
            <NavItem 
              icon={BarChart3} 
              text="Reports"
              active={currentPage === 'reports'}
              onClick={() => handleNavigate('reports')}
            />
          </NavGroup>
        )}
        
        {/* Settings - Admin only */}
        {isAdmin && (
          <NavGroup 
            title="SETTINGS" 
            defaultOpen={false}
            onToggle={() => toggleCollapse('settings')}
            isCollapsed={collapsed.settings}
          >
            <NavItem 
              icon={Settings} 
              text="Preferences"
              active={currentPage === 'settings'}
              onClick={() => handleNavigate('settings')}
            />
            <NavItem 
              icon={Users} 
              text="User Management"
              active={currentPage === 'users'}
              onClick={() => handleNavigate('users')}
            />
          </NavGroup>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-brand-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userData?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{userData?.role || 'Staff'}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

function NavGroup({ title, children, defaultOpen = true, onToggle, isCollapsed }: NavGroupProps & { onToggle: () => void, isCollapsed: boolean }) {
  return (
    <div className="space-y-1">
      <div 
        className="px-3 flex items-center justify-between cursor-pointer group"
        onClick={onToggle}
      >
        <span className="text-xs font-semibold text-gray-500 tracking-wider group-hover:text-brand-600 transition-colors">
          {title}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} 
        />
      </div>
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon: Icon, text, active = false, onClick, badge, children }: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        active 
          ? "bg-gradient-to-r from-brand-50 to-brand-100 text-brand-700 shadow-sm border border-brand-200/50" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
          active ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
        {text}
      </div>
      {badge && (
        <span className={cn(
          "px-2 py-0.5 text-xs rounded-full",
          active
            ? "bg-brand-200 text-brand-700"
            : "bg-gray-100 text-gray-600"
        )}>
          {badge}
        </span>
      )}
      {children}
    </motion.button>
  );
}

function Layers2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 14 10 7 10-7" />
      <path d="m2 9 10 7 10-7" />
      <path d="m2 4 10 7 10-7" />
    </svg>
  );
}

export default Sidebar;