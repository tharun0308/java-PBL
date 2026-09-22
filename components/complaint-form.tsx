'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { complaintCreateSchema, ComplaintCreateInput } from '@/lib/validations/complaint';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  Category,
  PRIORITIES,
  PRIORITY_LABELS,
  Priority,
} from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  AlertCircle,
  PlusCircle,
  MapPin,
  FileText,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function ComplaintForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplaintCreateInput>({
    resolver: zodResolver(complaintCreateSchema) as any,
    defaultValues: {
      category: 'ELECTRICAL',
      location: '',
      description: '',
      priority: 'MEDIUM',
    },
  });

  const selectedPriority = watch('priority');
  const watchedDescription = watch('description', '');

  const onSubmit = async (data: ComplaintCreateInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: data.category,
          location: data.location.trim(),
          description: data.description.trim(),
          priority: data.priority,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit complaint');
      }

      const complaintNumber = json.data?.complaintNumber || 'Ticket Created';

      toast.success(`Complaint Submitted!`, {
        description: `Ticket ${complaintNumber} has been logged and assigned initial Pending status.`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        duration: 5000,
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      toast.error('Submission Failed', {
        description: msg,
        icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-3xl mx-auto"
    >
      <Card className="shadow-2xl border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="space-y-1.5 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <PlusCircle className="w-4 h-4" />
            <span>Campus Grievance Filing</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            Register New Complaint
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Provide precise location details and a clear description to ensure fast dispatch to campus facilities.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="category"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Department Category <span className="text-rose-400">*</span></span>
              </label>
              <select
                id="category"
                {...register('category')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                {CATEGORIES.map((cat: Category) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Location Input */}
            <div className="space-y-2">
              <label
                htmlFor="location"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Campus Location <span className="text-rose-400">*</span></span>
              </label>
              <Input
                id="location"
                placeholder="e.g. Science Block, 2nd Floor, Lab 204 or Hostel B Room 112"
                className="bg-slate-950/70 border-white/10 text-white placeholder:text-slate-500"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Priority Radio Cards */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span>Urgency / Priority Level <span className="text-rose-400">*</span></span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRIORITIES.map((p: Priority) => {
                  const isSelected = selectedPriority === p;
                  let borderBadge = 'border-white/10 bg-slate-950/50 text-slate-300 hover:border-white/20';

                  if (isSelected) {
                    if (p === 'HIGH') {
                      borderBadge = 'border-rose-500 bg-rose-500/15 text-rose-300 ring-1 ring-rose-500 shadow-md shadow-rose-500/10';
                    } else if (p === 'MEDIUM') {
                      borderBadge = 'border-amber-500 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500 shadow-md shadow-amber-500/10';
                    } else {
                      borderBadge = 'border-indigo-500 bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500 shadow-md shadow-indigo-500/10';
                    }
                  }

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setValue('priority', p)}
                      className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${borderBadge}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-sm">
                          {PRIORITY_LABELS[p]}
                        </span>
                        <input
                          type="radio"
                          value={p}
                          className="sr-only"
                          {...register('priority')}
                        />
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10">
                          {p === 'HIGH' ? '24h SLA' : p === 'MEDIUM' ? '48h SLA' : '5d SLA'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1">
                        {p === 'HIGH'
                          ? 'Safety risk or immediate disruption'
                          : p === 'MEDIUM'
                          ? 'Standard facility maintenance'
                          : 'Minor or non-urgent request'}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.priority && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.priority.message}
                </p>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="description"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Issue Description <span className="text-rose-400">*</span></span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {watchedDescription.length} / 5000
                </span>
              </div>
              <Textarea
                id="description"
                rows={5}
                placeholder="Describe what is broken or required in detail (min 10 characters)..."
                className="bg-slate-950/70 border-white/10 text-white placeholder:text-slate-500 resize-y"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-w-[180px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Complaint...
                  </>
                ) : (
                  <>
                    <span>Submit Grievance</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
