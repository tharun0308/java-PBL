import React from 'react';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { getCurrentUser } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const isAdmin = user.role === 'MAIN_ADMIN' || user.role === 'STAFF_ADMIN';
  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
