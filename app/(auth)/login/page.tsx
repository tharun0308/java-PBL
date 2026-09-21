'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema, LoginInput } from '@/lib/validations/complaint';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, LogIn, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      // 1. First attempt local database login
      const localRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (localRes.ok) {
        const json = await localRes.json();
        toast.success('Signed in successfully', {
          description: `Welcome back, ${json.data.full_name}!`,
        });

        if (json.data.role === 'admin' && redirectTo === '/dashboard') {
          router.push('/admin/dashboard');
        } else {
          router.push(redirectTo);
        }
        router.refresh();
        return;
      }

      // 2. Fallback to Supabase Cloud if configured
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        const localErr = await localRes.json().catch(() => null);
        throw new Error(localErr?.error || error.message);
      }

      if (authData?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        toast.success('Signed in successfully', {
          description: `Welcome back!`,
        });

        if (profile?.role === 'admin' && redirectTo === '/dashboard') {
          router.push('/admin/dashboard');
        } else {
          router.push(redirectTo);
        }
        router.refresh();
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Invalid email or password';
      toast.error('Authentication Failed', {
        description: msg,
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      setValue('email', 'admin@college.edu');
      setValue('password', 'Password123!');
    } else {
      setValue('email', 'student@college.edu');
      setValue('password', 'Password123!');
    }
  };

  return (
    <Card className="shadow-lg border-slate-200 bg-white">
      <CardHeader className="space-y-1 pb-6 border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">Sign In</CardTitle>
        <CardDescription className="text-slate-500">
          Enter your college email and password to access SCMS.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. yourname@college.edu"
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Password
              </label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.password.message}
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
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Demo Account Quick Fill */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-2.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Quick Demo Fill (Pre-loaded in Database):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('student')}
              className="text-xs py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded border border-slate-200 text-left transition-colors cursor-pointer"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="text-xs py-1.5 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded border border-purple-200 text-left transition-colors cursor-pointer"
            >
              Demo Administrator
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
            Register now
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card className="shadow-lg border-slate-200 bg-white p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        </Card>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
