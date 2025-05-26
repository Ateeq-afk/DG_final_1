import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import EmailVerification from './EmailVerification';

type AuthView = 'signIn' | 'signUp' | 'forgotPassword' | 'verifyEmail';

interface AuthModalProps {
  defaultView?: AuthView;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  onClose: () => void;
}

export default function AuthModal({
  defaultView = 'signIn',
  open = true,
  onOpenChange,
  onSuccess,
  onClose,
}: AuthModalProps) {
  const [view, setView] = useState<AuthView>(defaultView);
  const [error, setError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const handleError = (message: string) => {
    setError(message);
  };

  const handleVerifyEmailRequested = (email: string) => {
    setVerificationEmail(email);
    setView('verifyEmail');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {view === 'signIn' && (
          <SignInForm
            onSuccess={handleSuccess}
            onError={handleError}
            onForgotPassword={() => setView('forgotPassword')}
            onToggleMode={() => setView('signUp')}
          />
        )}

        {view === 'signUp' && (
          <SignUpForm
            onSuccess={handleVerifyEmailRequested}
            onError={handleError}
            onToggleMode={() => setView('signIn')}
          />
        )}

        {view === 'forgotPassword' && (
          <ForgotPasswordForm
            onSuccess={() => setView('signIn')}
            onBack={() => setView('signIn')}
          />
        )}

        {view === 'verifyEmail' && (
          <EmailVerification
            email={verificationEmail}
            onClose={() => setView('signIn')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}