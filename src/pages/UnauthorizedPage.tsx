import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { userData, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldOff className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        
        <p className="text-gray-600 mb-6">
          {userData ? (
            <>
              Your current role <span className="font-medium">{userData.role}</span> does not have permission to access this page.
            </>
          ) : (
            'You do not have permission to access this page.'
          )}
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => signOut().then(() => navigate('/signin'))}
            className="w-full"
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}