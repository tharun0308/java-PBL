'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema, RegisterInput } from '@/lib/validations/complaint';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      // 1. First attempt local database register
      const localRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (localRes.ok) {
        toast.success('Registration Successful!', {
          description: `Welcome to SCMS, ${data.fullName}!`,
        });
        router.push('/dashboard');
        router.refresh();
        return;
      }

      // 2. Fallback to Supabase Cloud if configured
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        const localErr = await localRes.json().catch(() => null);
        throw new Error(localErr?.error || error.message);
      }

      if (authData.user) {
        toast.success('Registration Successful!', {
          description: `Welcome to SCMS, ${data.fullName}!`,
        });
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Registration failed';
      toast.error('Registration Failed', {
        description: msg,
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-slate-200 bg-white">
      <CardHeader className="space-y-1 pb-6 border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">Create Account</CardTitle>
        <CardDescription className="text-slate-500">
          Register with your college credentials to report and track issues.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Full Name
            </label>
            <Input
              id="fullName"
              placeholder="e.g. Alex Johnson"
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              College Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. alex.j@college.edu"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Register as Student
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
