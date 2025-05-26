import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SignInPage() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex min-h-screen">
        {/* Marketing panel (desktop only) */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-12">
          <div className="max-w-lg mx-auto text-white space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">K2K Logistics</h1>
            </div>
            <p className="text-lg">
              One-stop platform for all your logistics operations. Book, track,
              and manage shipments—right here.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <span className="text-2xl font-bold">5K+</span>
                </div>
                <div>
                  <h3 className="font-semibold">Active Users</h3>
                  <p className="text-sm">across all branches</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <span className="text-2xl font-bold">1M+</span>
                </div>
                <div>
                  <h3 className="font-semibold">Deliveries</h3>
                  <p className="text-sm">completed this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication forms panel */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Welcome to DesiCargo</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Demo Mode - No authentication required
                </p>
              </div>

              <div className="mt-8">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleSignIn}
                >
                  Enter Dashboard
                </Button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>This is a demo application. Click the button above to enter.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}