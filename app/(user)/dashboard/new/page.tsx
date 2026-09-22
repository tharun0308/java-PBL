import React from 'react';
import { redirect } from 'next/navigation';
import { ComplaintForm } from '@/components/complaint-form';
import { getCurrentUser } from '@/lib/auth';

export default function DashboardNewComplaintPage() {
  const user = getCurrentUser();

  if (user?.role === 'MAIN_ADMIN' || user?.role === 'STAFF_ADMIN') {
    redirect('/admin/dashboard');
  }

  return (
    <div className="py-4">
      <ComplaintForm />
    </div>
  );
}
