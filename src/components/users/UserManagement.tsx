import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash, 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Download,
  ArrowUpDown,
  UserCog,
  Key,
  Lock,
  Unlock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';

interface UserManagementProps {
  searchQuery?: string;
  roleFilter?: string;
  statusFilter?: string;
  showAddUser?: boolean;
  onAddUserClose?: () => void;
}

// Mock user data
const MOCK_USERS = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@desicargo.com',
    phone: '+91 9876543210',
    role: 'admin',
    status: 'active',
    lastLogin: '2023-12-15T10:30:00Z',
    createdAt: '2023-01-10T08:15:00Z',
    branches: ['Mumbai HQ', 'Delhi Branch'],
    permissions: ['manage_users', 'manage_bookings', 'manage_settings']
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@desicargo.com',
    phone: '+91 9876543211',
    role: 'operator',
    status: 'active',
    lastLogin: '2023-12-20T14:45:00Z',
    createdAt: '2023-02-15T09:30:00Z',
    branches: ['Mumbai HQ'],
    permissions: ['create_bookings', 'view_bookings']
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit@desicargo.com',
    phone: '+91 9876543212',
    role: 'manager',
    status: 'active',
    lastLogin: '2023-12-18T11:20:00Z',
    createdAt: '2023-03-05T10:45:00Z',
    branches: ['Bangalore Branch'],
    permissions: ['manage_bookings', 'view_reports', 'manage_vehicles']
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    email: 'sneha@desicargo.com',
    phone: '+91 9876543213',
    role: 'operator',
    status: 'inactive',
    lastLogin: '2023-11-30T09:15:00Z',
    createdAt: '2023-04-20T11:30:00Z',
    branches: ['Chennai Branch'],
    permissions: ['create_bookings', 'view_bookings']
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram@desicargo.com',
    phone: '+91 9876543214',
    role: 'admin',
    status: 'active',
    lastLogin: '2023-12-21T16:10:00Z',
    createdAt: '2023-05-12T13:45:00Z',
    branches: ['Delhi Branch', 'Kolkata Branch'],
    permissions: ['manage_users', 'manage_bookings', 'manage_settings', 'manage_vehicles']
  }
];

// Mock roles data
const ROLES = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features and settings',
    permissions: ['manage_users', 'manage_bookings', 'manage_settings', 'manage_vehicles', 'view_reports', 'manage_branches']
  },
  {
    id: 'manager',
    name: 'Branch Manager',
    description: 'Manage branch operations and staff',
    permissions: ['manage_bookings', 'view_reports', 'manage_vehicles', 'view_users']
  },
  {
    id: 'operator',
    name: 'Booking Operator',
    description: 'Create and manage bookings',
    permissions: ['create_bookings', 'view_bookings']
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'View-only access to data',
    permissions: ['view_bookings', 'view_reports']
  }
];

// Permission descriptions
const PERMISSIONS = {
  manage_users: 'Create, edit, and delete user accounts',
  manage_bookings: 'Full control over all bookings',
  create_bookings: 'Create new bookings',
  view_bookings: 'View booking details',
  manage_settings: 'Configure system settings',
  view_reports: 'Access and generate reports',
  manage_vehicles: 'Add, edit, and manage vehicles',
  manage_branches: 'Create and manage branch offices',
  view_users: 'View user information'
};

export default function UserManagement({
  searchQuery = '',
  roleFilter = 'all',
  statusFilter = 'all',
  showAddUser = false,
  onAddUserClose = () => {}
}: UserManagementProps) {
  const [sortField, setSortField] = useState<'name' | 'role' | 'lastLogin'>('lastLogin');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showRoleDetails, setShowRoleDetails] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { showSuccess, showError } = useNotificationSystem();
  const itemsPerPage = 10;
  
  // Filter users based on search and filters
  const filteredUsers = React.useMemo(() => {
    return MOCK_USERS.filter(user => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchLower);
      
      if (!matchesSearch) return false;
      
      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      
      // Status filter
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;
      
      return true;
    }).sort((a, b) => {
      // Sorting
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'role') {
        return sortDirection === 'asc'
          ? a.role.localeCompare(b.role)
          : b.role.localeCompare(a.role);
      } else if (sortField === 'lastLogin') {
        return sortDirection === 'asc'
          ? new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime()
          : new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
      }
      return 0;
    });
  }, [searchQuery, roleFilter, statusFilter, sortField, sortDirection]);
  
  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSort = (field: 'name' | 'role' | 'lastLogin') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const handleAddUser = async (data: any) => {
    try {
      setLoading(true);
      
      // In a real app, this would add a user
      // For demo purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('User Added', 'User has been added successfully');
      onAddUserClose();
    } catch (err) {
      console.error('Failed to add user:', err);
      showError('Add Failed', 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditUser = async (data: any) => {
    try {
      setLoading(true);
      
      // In a real app, this would update a user
      // For demo purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('User Updated', 'User has been updated successfully');
      setEditingUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
      showError('Update Failed', 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      
      // In a real app, this would delete a user
      // For demo purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('User Deleted', 'User has been deleted successfully');
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
      showError('Delete Failed', 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = () => {
    // In a real app, this would export user data
    showSuccess('Export Started', 'User data is being exported');
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-1">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="users" className="mt-0 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th 
                      className="text-left text-sm font-medium text-gray-600 px-6 py-4 cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        User
                        {sortField === 'name' && (
                          <ArrowUpDown className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left text-sm font-medium text-gray-600 px-6 py-4 cursor-pointer"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-2">
                        Role
                        {sortField === 'role' && (
                          <ArrowUpDown className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Branches</th>
                    <th 
                      className="text-left text-sm font-medium text-gray-600 px-6 py-4 cursor-pointer"
                      onClick={() => handleSort('lastLogin')}
                    >
                      <div className="flex items-center gap-2">
                        Last Login
                        {sortField === 'lastLogin' && (
                          <ArrowUpDown className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Status</th>
                    <th className="text-right text-sm font-medium text-gray-600 px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' && <Shield className="h-4 w-4 text-purple-600" />}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'manager'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.branches.map((branch, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {branch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.lastLogin).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'active' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setShowPermissions(user.id)}>
                                <Key className="h-4 w-4 mr-2" />
                                Permissions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === 'active' ? (
                                <DropdownMenuItem>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => setUserToDelete(user.id)}
                                className="text-red-600"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                        <p className="text-gray-500 mt-1">
                          {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                            ? 'Try adjusting your filters to see more results'
                            : 'Add your first user to get started'}
                        </p>
                        {!searchQuery && roleFilter === 'all' && statusFilter === 'all' && (
                          <Button 
                            onClick={() => setShowAddUser(true)}
                            className="mt-4"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add User
                          </Button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredUsers.length}</span> users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="hidden md:inline-flex"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="roles" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map((role) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      role.id === 'admin'
                        ? 'bg-purple-100 text-purple-600'
                        : role.id === 'manager'
                        ? 'bg-blue-100 text-blue-600'
                        : role.id === 'operator'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {role.id === 'admin' ? (
                        <Shield className="h-5 w-5" />
                      ) : role.id === 'manager' ? (
                        <UserCog className="h-5 w-5" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      role.id === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : role.id === 'manager'
                        ? 'bg-blue-100 text-blue-800'
                        : role.id === 'operator'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {role.permissions.length} permissions
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowRoleDetails(role.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="permissions" className="mt-0 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">System Permissions</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(PERMISSIONS).map(([key, description]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">{key.replace(/_/g, ' ')}</h4>
                      <div className="flex items-center gap-2">
                        {ROLES.filter(role => role.permissions.includes(key)).map(role => (
                          <span 
                            key={role.id}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              role.id === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : role.id === 'manager'
                                ? 'bg-blue-100 text-blue-800'
                                : role.id === 'operator'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Create a new user account
            </DialogDescription>
          </DialogHeader>
          
          <UserForm 
            onSubmit={handleAddUser}
            onCancel={onAddUserClose}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog 
        open={!!editingUser} 
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <UserForm 
              initialData={editingUser}
              onSubmit={handleEditUser}
              onCancel={() => setEditingUser(null)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!userToDelete} 
        onOpenChange={(open) => {
          if (!open) setUserToDelete(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setUserToDelete(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Role Details Dialog */}
      <Dialog 
        open={!!showRoleDetails} 
        onOpenChange={(open) => {
          if (!open) setShowRoleDetails(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Role Details</DialogTitle>
          </DialogHeader>
          
          {showRoleDetails && (
            <RoleDetails 
              role={ROLES.find(r => r.id === showRoleDetails)!}
              onClose={() => setShowRoleDetails(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* User Permissions Dialog */}
      <Dialog 
        open={!!showPermissions} 
        onOpenChange={(open) => {
          if (!open) setShowPermissions(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Permissions</DialogTitle>
          </DialogHeader>
          
          {showPermissions && (
            <UserPermissions 
              user={MOCK_USERS.find(u => u.id === showPermissions)!}
              onClose={() => setShowPermissions(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface UserFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

function UserForm({ initialData, onSubmit, onCancel, loading = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'operator',
    status: initialData?.status || 'active',
    branches: initialData?.branches || [],
    sendInvite: !initialData
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleSelectChange('role', value)}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="manager">Branch Manager</SelectItem>
            <SelectItem value="operator">Booking Operator</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleSelectChange('status', value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {!initialData && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="sendInvite"
            name="sendInvite"
            checked={formData.sendInvite}
            onChange={handleCheckboxChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="sendInvite" className="font-normal">
            Send invitation email
          </Label>
        </div>
      )}
      
      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {initialData ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              {initialData ? 'Update User' : 'Add User'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

interface RoleDetailsProps {
  role: {
    id: string;
    name: string;
    description: string;
    permissions: string[];
  };
  onClose: () => void;
}

function RoleDetails({ role, onClose }: RoleDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
          role.id === 'admin'
            ? 'bg-purple-100 text-purple-600'
            : role.id === 'manager'
            ? 'bg-blue-100 text-blue-600'
            : role.id === 'operator'
            ? 'bg-green-100 text-green-600'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {role.id === 'admin' ? (
            <Shield className="h-6 w-6" />
          ) : role.id === 'manager' ? (
            <UserCog className="h-6 w-6" />
          ) : (
            <User className="h-6 w-6" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{role.name}</h3>
          <p className="text-gray-600">{role.description}</p>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Permissions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {role.permissions.map((permission) => (
            <div key={permission} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 capitalize">{permission.replace(/_/g, ' ')}</p>
                <p className="text-sm text-gray-600">{PERMISSIONS[permission]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

interface UserPermissionsProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
  };
  onClose: () => void;
}

function UserPermissions({ user, onClose }: UserPermissionsProps) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<string[]>(user.permissions);
  const { showSuccess } = useNotificationSystem();
  
  const handleTogglePermission = (permission: string) => {
    setPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };
  
  const handleSave = async () => {
    setLoading(true);
    
    // In a real app, this would update user permissions
    // For demo purposes, we'll simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    showSuccess('Permissions Updated', 'User permissions have been updated successfully');
    setLoading(false);
    onClose();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">User Permissions</h4>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : user.role === 'manager'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>
        
        <div className="space-y-3">
          {Object.entries(PERMISSIONS).map(([key, description]) => (
            <div key={key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  id={`perm-${key}`}
                  checked={permissions.includes(key)}
                  onChange={() => handleTogglePermission(key)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`perm-${key}`} className="font-medium text-gray-900 capitalize cursor-pointer">
                  {key.replace(/_/g, ' ')}
                </label>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Permissions'
          )}
        </Button>
      </div>
    </div>
  );
}