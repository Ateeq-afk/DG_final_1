import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useBranches } from '@/hooks/useBranches';
import { Loader2, Mail, Lock, User } from 'lucide-react';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['staff', 'branch_manager', 'accountant', 'admin']),
  branchId: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess: (email: string) => void;
  onError: (message: string) => void;
  onToggleMode: () => void;
}

export default function SignUpForm({
  onSuccess,
  onError,
  onToggleMode,
}: SignUpFormProps) {
  const { signUp } = useAuth();
  const { branches, loading: branchesLoading } = useBranches();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'staff',
    },
  });

  const selectedRole = watch('role');
  const needsBranch = selectedRole === 'staff' || selectedRole === 'branch_manager';

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setLoading(true);
      await signUp(
        data.email, 
        data.password, 
        data.name, 
        data.role, 
        needsBranch ? data.branchId : undefined
      );
      onSuccess(data.email);
    } catch (error) {
      console.error('Sign up error:', error);
      onError(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Create an account</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sign up to get started with DesiCargo
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="name"
              placeholder="John Doe"
              className="pl-10"
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

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
          <Label htmlFor="password">Password</Label>
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select 
            onValueChange={(value) => setValue('role', value as any)} 
            defaultValue="staff"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="branch_manager">Branch Manager</SelectItem>
              <SelectItem value="accountant">Accountant</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        {needsBranch && (
          <div className="space-y-2">
            <Label htmlFor="branchId">Branch</Label>
            <Select 
              onValueChange={(value) => setValue('branchId', value)} 
              disabled={branchesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name} - {branch.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.branchId && (
              <p className="text-sm text-red-500">{errors.branchId.message}</p>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Sign up'
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-medium text-blue-600"
            onClick={onToggleMode}
          >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
}