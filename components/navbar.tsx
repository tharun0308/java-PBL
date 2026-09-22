'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserSession } from '@/lib/auth';
import { Button } from './ui/button';
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
  Sparkles,
  UserCheck,
} from 'lucide-react';

import { BrandIcon } from './brand-logo';

interface NavbarProps {
  user?: UserSession | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAdmin = user?.role === 'MAIN_ADMIN' || user?.role === 'STAFF_ADMIN';
  const roleDisplay =
    user?.role === 'MAIN_ADMIN'
      ? 'Main Admin'
      : user?.role === 'STAFF_ADMIN'
      ? 'Staff Admin'
      : user?.userTitle || 'Student';

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Signed out successfully');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Error signing out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    {
      name: 'My Complaints',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: !!user && !isAdmin,
    },
    {
      name: 'New Complaint',
      href: '/complaints/new',
      icon: PlusCircle,
      show: !!user && !isAdmin,
    },
    {
      name: 'Admin Portal',
      href: '/admin/dashboard',
      icon: ShieldCheck,
      show: isAdmin,
    },
    {
      name: 'All Complaints',
      href: '/admin/complaints',
      icon: ShieldAlert,
      show: isAdmin,
    },
    {
      name: 'Staff Requests',
      href: '/admin/staff-requests',
      icon: UserCheck,
      show: user?.role === 'MAIN_ADMIN',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-slate-950/70 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              href={user ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all group-hover:scale-105">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center p-2">
                  <BrandIcon className="w-full h-full group-hover:rotate-6 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white tracking-tight text-lg">
                    SCMS
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Campus
                  </span>
                </div>
                <span className="hidden sm:inline text-[11px] text-slate-400 font-normal">
                  Smart Complaint System
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
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
                      className={`inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2 text-indigo-400" />
                      {link.name}
                    </Link>
                  );
                })}
            </nav>
          )}

          {/* User Controls / Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                    {user.fullName || user.email}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        user.role === 'MAIN_ADMIN'
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          : user.role === 'STAFF_ADMIN'
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {roleDisplay}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="glow">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 px-4 pt-3 pb-5 space-y-3 backdrop-blur-xl">
          {user && (
            <div className="py-2.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.fullName || 'Campus Member'}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {roleDisplay}
              </span>
            </div>
          )}

          {user ? (
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
                      className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2.5 text-indigo-400" />
                      {link.name}
                    </Link>
                  );
                })}

              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2.5" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="glow" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
