'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Button } from './ui/button';
import { NotificationBell } from './notification-bell';
import { ThemeToggle } from './theme-toggle';
import { toast } from 'sonner';
import {
  ShieldAlert,
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  profile?: Profile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supabase = createClient();
  const isAdmin = profile?.role === 'admin';

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await supabase.auth.signOut().catch(() => {});
      toast.success('Signed out successfully');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Error signing out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Admin manages complaints and cannot file complaints; student files and tracks complaints
  const navLinks = [
    {
      name: 'My Complaints',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: !!profile && !isAdmin,
    },
    {
      name: 'New Complaint',
      href: '/complaints/new',
      icon: PlusCircle,
      show: !!profile && !isAdmin,
    },
    {
      name: 'Admin Portal',
      href: '/admin/dashboard',
      icon: ShieldCheck,
      show: isAdmin,
    },
    {
      name: 'Manage All',
      href: '/admin/complaints',
      icon: ShieldAlert,
      show: isAdmin,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              href={profile ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                S
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                  SCMS
                </span>
                <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 font-normal ml-2 border-l border-slate-200 dark:border-slate-800 pl-2">
                  Smart Complaint System
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          {profile && (
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks
                .filter((l) => l.show)
                .map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    (link.href !== '/dashboard' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1.5" />
                      {link.name}
                    </Link>
                  );
                })}
            </nav>
          )}

          {/* User Controls / Actions */}
          <div className="hidden md:flex items-center gap-2">
            {profile && <NotificationBell />}
            <ThemeToggle />

            {profile ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                    {profile.full_name}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        isAdmin
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {profile.role}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1">
            {profile && <NotificationBell />}
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          {profile && (
            <div className="py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.full_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isAdmin
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {profile.role}
              </span>
            </div>
          )}

          {profile ? (
            <>
              {navLinks
                .filter((l) => l.show)
                .map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {link.name}
                    </Link>
                  );
                })}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
