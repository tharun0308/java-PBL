import React from 'react';
import { redirect } from 'next/navigation';
import { ComplaintForm } from '@/components/complaint-form';
import { getCurrentProfile } from '@/lib/auth';

export default function NewComplaintPage() {
  const profile = getCurrentProfile();

  // Administrators manage complaints and cannot file new complaints
  if (profile?.role === 'admin') {
    redirect('/admin/dashboard');
  }

  return (
    <div className="py-4">
      <ComplaintForm />
    </div>
  );
}
