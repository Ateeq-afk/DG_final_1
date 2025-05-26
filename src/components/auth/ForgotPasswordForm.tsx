import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function ForgotPasswordForm({
  onSuccess,
  onBack,
}: ForgotPasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setSubmitted(true);
      // Don't redirect immediately, show success message first
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      // Even if there's an error, we don't show it to prevent email enumeration
      // Just show the success message anyway
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="text-gray-600">
          We've sent a password reset link to your email address. Please check your inbox.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={onBack}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Reset your password</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              placeholder="you@example.com"
              className="pl-10"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </div>
      </form>
    </div>
  );
}