import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/navbar';
import { Profile } from '@/lib/types';
import { getCurrentProfile } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Check local session
  const localProfile = getCurrentProfile();
  if (localProfile) {
    if (localProfile.role !== 'admin') {
      redirect('/dashboard');
    }
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar profile={localProfile} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  // 2. Check Supabase session
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const adminProfile: Profile = profile;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar profile={adminProfile} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
