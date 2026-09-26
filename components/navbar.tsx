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
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-charcoal text-white shadow-[0_4px_16px_rgba(31,41,55,0.08)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              href={user ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-charcoal border border-slate-700/80 shadow-sm transition-all group-hover:scale-105 flex items-center justify-center p-2">
                <BrandIcon className="w-full h-full group-hover:rotate-6 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white tracking-tight text-lg">
                    SCMS
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-lavender text-charcoal">
                    Campus
                  </span>
                </div>
                <span className="hidden sm:inline text-[11px] text-slate-300 font-normal">
                  Smart Complaint System
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5">
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
                          ? 'bg-lavender-soft text-charcoal font-semibold shadow-sm'
                          : 'text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-charcoal' : 'text-lavender'}`} />
                      {link.name}
                    </Link>
                  );
                })}
            </nav>
          )}

          {/* User Controls / Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-white/20">
                <div className="flex flex-col text-right">
                  <span
                    className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[260px]"
                    title={user.fullName || user.email}
                  >
                    {user.fullName || user.email}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        user.role === 'MAIN_ADMIN'
                          ? 'bg-lavender text-charcoal'
                          : user.role === 'STAFF_ADMIN'
                          ? 'bg-lavender-soft text-charcoal'
                          : 'bg-mint text-charcoal'
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
                  className="text-slate-300 hover:text-rose-300 hover:bg-white/10 rounded-xl"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
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
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal/40 bg-charcoal px-4 pt-3 pb-5 space-y-3">
          {user && (
            <div className="py-2.5 border-b border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lavender">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.fullName || 'Campus Member'}</p>
                  <p className="text-xs text-slate-300">{user.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-lavender text-charcoal">
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
                          ? 'bg-lavender-soft text-charcoal font-semibold shadow-sm'
                          : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-2.5 ${isActive ? 'text-charcoal' : 'text-lavender'}`} />
                      {link.name}
                    </Link>
                  );
                })}

              <div className="pt-2 border-t border-white/15">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/20 cursor-pointer"
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
