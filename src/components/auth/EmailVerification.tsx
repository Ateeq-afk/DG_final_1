import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface EmailVerificationProps {
  email: string;
  onClose: () => void;
}

export default function EmailVerification({ email, onClose }: EmailVerificationProps) {
  const [resending, setResending] = useState(false);
  
  const handleResendEmail = async () => {
    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      // Show success message
      alert('Verification email resent successfully!');
    } catch (error) {
      console.error('Error resending verification email:', error);
      alert('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };
  
  return (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <Mail className="h-8 w-8 text-blue-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold">Check your email</h2>
        <p className="text-gray-600 mt-2">
          We've sent a verification email to:
        </p>
        <p className="font-medium text-blue-600 mt-1">{email}</p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
        <p>Please check your email and click the verification link to complete your registration.</p>
      </div>
      
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResendEmail}
          disabled={resending}
        >
          {resending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Resending...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Resend verification email
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="w-full flex items-center justify-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Button>
      </div>
    </div>
  );
}