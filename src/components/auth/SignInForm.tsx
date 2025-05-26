import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  onForgotPassword: () => void;
  onToggleMode: () => void;
}

export default function SignInForm({
  onSuccess,
  onError,
  onForgotPassword,
  onToggleMode,
}: SignInFormProps) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      setLoading(true);
      await signIn(data.email, data.password);
      onSuccess();
    } catch (error) {
      console.error('Sign in error:', error);
      onError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sign in to your account to continue
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Button
              type="button"
              variant="link"
              className="text-xs font-medium text-blue-600 p-0 h-auto"
              onClick={onForgotPassword}
            >
              Forgot password?
            </Button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="rememberMe" {...register('rememberMe')} />
          <Label htmlFor="rememberMe" className="font-normal">
            Remember me
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{' '}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-medium text-blue-600"
            onClick={onToggleMode}
          >
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );
}