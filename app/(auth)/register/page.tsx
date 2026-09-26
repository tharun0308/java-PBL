'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema, RegisterInput } from '@/lib/validations/complaint';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, UserPlus, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
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

function calculatePasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };

  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
  if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
  return { score: 3, label: 'Strong', color: 'bg-emerald-600' };
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userTitle: 'Student',
    },
  });

  const passwordValue = watch('password', '');
  const passwordStrength = calculatePasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.error || 'Registration failed');
      }

      toast.success('Registration Successful!', {
        description: `Welcome to SCMS, ${data.fullName}!`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      });

      router.push('/dashboard');
      router.refresh();
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

  const handleGoogleSignup = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  return (
    <>
      <FloatingCards />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Card className="shadow-xl border-border bg-surface">
          <CardHeader className="space-y-1.5 pb-6 border-b border-border">
            <CardTitle className="text-2xl font-bold text-charcoal tracking-tight">
              Create an Account
            </CardTitle>
            <CardDescription className="text-slate text-sm">
              Join the campus grievance portal to report issues and track resolutions.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-5">
            {/* Google SSO Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 py-2.5 bg-white hover:bg-slate-50 border-border text-charcoal shadow-sm transition-all"
            >
              <GoogleIcon />
              <span className="font-medium text-sm">Sign up with Google</span>
            </Button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative px-3 bg-surface text-[11px] font-semibold uppercase tracking-wider text-slate">
                Or with email
              </span>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  placeholder="e.g. Alex Johnson"
                  className="bg-white border-border focus:border-lavender-strong text-charcoal placeholder:text-slate"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-500 flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                >
                  College Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. alex.j@campus.edu"
                  className="bg-white border-border focus:border-lavender-strong text-charcoal placeholder:text-slate"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="bg-white border-border focus:border-lavender-strong text-charcoal placeholder:text-slate pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwordValue && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate">Password strength:</span>
                      <span className="font-semibold text-charcoal">{passwordStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full flex-1 transition-all rounded-full ${
                          passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`h-full flex-1 transition-all rounded-full ${
                          passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`h-full flex-1 transition-all rounded-full ${
                          passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs text-rose-500 flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className="bg-white border-border focus:border-lavender-strong text-charcoal placeholder:text-slate pr-10"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Informative notice about role assignment */}
              <div className="p-3 rounded-xl bg-pale-lavender border border-lavender/30 text-lavender-strong text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-lavender-strong flex-shrink-0 mt-0.5" />
                <p>
                  Self-registered accounts start as <strong>Student / Faculty</strong>. Staff Admin privileges require verification by the Main Administrator.
                </p>
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full mt-2 py-2.5 font-medium shadow-sm"
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
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Footer Navigation */}
            <div className="pt-4 border-t border-border text-center text-xs text-slate">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-lavender-strong hover:underline transition-colors inline-flex items-center gap-1"
              >
                Sign in
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
