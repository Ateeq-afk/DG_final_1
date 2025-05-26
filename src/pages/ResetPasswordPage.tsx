import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

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
              Reset your password to regain access to your account.
            </p>
          </div>
        </div>

        {/* Reset password form panel */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <ResetPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}