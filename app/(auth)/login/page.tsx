'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema, LoginInput } from '@/lib/validations/complaint';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, LogIn, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FloatingCards } from '@/components/floating-cards';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.error || 'Invalid credentials');
      }

      toast.success('Signed in successfully', {
        description: `Welcome back, ${resData.user?.fullName || 'User'}!`,
      });

      const user = resData.user;
      const userRole = user?.role;
      const staffStatus = user?.staffAdminStatus;
      const onboardingDone = user?.onboardingCompleted;

      if (onboardingDone === false && userRole !== 'MAIN_ADMIN') {
        router.push('/onboarding');
      } else if (staffStatus === 'PENDING') {
        router.push('/pending-approval');
      } else if ((userRole === 'MAIN_ADMIN' || (userRole === 'STAFF_ADMIN' && staffStatus === 'APPROVED')) && redirectTo === '/dashboard') {
        router.push('/admin/dashboard');
      } else {
        router.push(redirectTo);
      }
      router.refresh();
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

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card className="shadow-2xl border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="space-y-1.5 pb-6 border-b border-white/[0.08]">
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Enter your college credentials or sign in with Google to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">
          {/* Google SSO Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 bg-slate-800/60 hover:bg-slate-800 border-white/10 hover:border-white/20 text-white shadow-sm"
          >
            <GoogleIcon />
            <span className="font-medium text-sm">Continue with Google</span>
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <span className="relative px-3 bg-slate-900 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Or with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="e.g. name@campus.edu"
                className="bg-slate-950/60 border-white/10 focus:border-indigo-500 text-white placeholder:text-slate-400"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="bg-slate-950/60 border-white/10 focus:border-indigo-500 text-white placeholder:text-slate-400 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="glow"
              className="w-full mt-3 py-2.5 font-medium"
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

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-white/[0.08] text-center text-xs text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/register"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
            >
              Register now
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <>
      <FloatingCards />
      <Suspense
        fallback={
          <Card className="shadow-2xl border-white/10 bg-slate-900/80 p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </>
  );
}
