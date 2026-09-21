'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CATEGORIES, PRIORITIES, Priority, Category } from '@/lib/constants';
import { complaintCreateSchema, ComplaintCreateInput } from '@/lib/validations/complaint';
import { aiClassifyComplaint } from '@/lib/ai-triage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Loader2,
  AlertCircle,
  Send,
  CheckCircle,
  Sparkles,
  Camera,
  X,
  AlertTriangle,
  FileImage,
} from 'lucide-react';

interface DuplicateMatch {
  id: string;
  complaint_number: number;
  location: string;
  category: string;
  status: string;
}

export function ComplaintForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplaintCreateInput>({
    resolver: zodResolver(complaintCreateSchema),
    defaultValues: {
      category: 'Electrical',
      location: '',
      description: '',
      priority: 'Medium',
      image_url: null,
    },
  });

  const selectedPriority = watch('priority');
  const watchedCategory = watch('category');
  const watchedLocation = watch('location');
  const watchedDescription = watch('description');

  // Handle Photo File Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setValue('image_url', base64);
      toast.success('Photo attached successfully.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setValue('image_url', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // AI Auto-Classification Handler
  const handleAiClassify = () => {
    if (!watchedDescription || watchedDescription.trim().length < 5) {
      toast.info('Please write a brief description first so AI can analyze it.');
      return;
    }

    const result = aiClassifyComplaint(watchedDescription, watchedLocation);
    setValue('category', result.category);
    setValue('priority', result.priority);

    toast.success('✨ AI Classified Successfully!', {
      description: `Predicted "${result.category}" with ${result.priority} priority. (${Math.round(result.confidence * 100)}% match)`,
      icon: <Sparkles className="w-5 h-5 text-indigo-500" />,
    });
  };

  // Duplicate Check as user types location
  useEffect(() => {
    if (!watchedLocation || watchedLocation.trim().length < 4) {
      setDuplicateMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          category: watchedCategory,
          location: watchedLocation,
        });
        const res = await fetch(`/api/complaints/check-duplicate?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setDuplicateMatches(json.data || []);
        }
      } catch {
        // Ignore check error
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedLocation, watchedCategory]);

  const onSubmit = async (data: ComplaintCreateInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit complaint');
      }

      toast.success('Complaint Submitted Successfully!', {
        description: `Your complaint has been logged as #SCMS-${String(
          result.data.complaint_number
        ).padStart(4, '0')}.`,
        icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      });

      router.push(`/complaints/${result.data.id}`);
      router.refresh();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'An error occurred while submitting.';
      toast.error('Submission Failed', {
        description: msg,
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 pb-6">
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
          Register New Complaint
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Provide accurate details and photos to help facilities teams locate and resolve your issue.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Duplicate Detection Alert Banner */}
          {duplicateMatches.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Similar complaint already active in this area:</p>
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  {duplicateMatches.map((m) => (
                    <li key={m.id}>
                      <span className="font-mono font-bold">#SCMS-{String(m.complaint_number).padStart(4, '0')}</span> ({m.category}) at {m.location} — <span className="font-semibold">{m.status}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                  You may still submit if your issue is separate.
                </p>
              </div>
            </div>
          )}

          {/* Description with AI Assistant Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAiClassify}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                AI Auto-Classify
              </button>
            </div>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe the issue in detail (e.g. 'Ceiling fan sparking violently and making grinding noise')..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Category <span className="text-rose-500">*</span>
            </label>
            <Select id="category" {...register('category')}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
            {errors.category && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Exact Location <span className="text-rose-500">*</span>
            </label>
            <Input
              id="location"
              placeholder="e.g. Block C, 2nd Floor, Lab 203 or Hostel 3 Room 114"
              {...register('location')}
            />
            {errors.location && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Priority Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRIORITIES.map((p: Priority) => {
                const isSelected = selectedPriority === p;
                let activeColor = 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200';
                if (isSelected) {
                  if (p === 'High') activeColor = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold ring-1 ring-rose-500';
                  else if (p === 'Medium') activeColor = 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold ring-1 ring-amber-500';
                  else activeColor = 'border-slate-500 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold ring-1 ring-slate-500';
                }

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setValue('priority', p)}
                    className={`flex items-center justify-center p-3 rounded-lg border text-sm transition-all cursor-pointer ${activeColor}`}
                  >
                    <input
                      type="radio"
                      value={p}
                      className="sr-only"
                      {...register('priority')}
                    />
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>
            {errors.priority && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.priority.message}
              </p>
            )}
          </div>

          {/* Defect Photo Attachment */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-500" />
                Attach Photo Evidence (Optional)
              </span>
              <span className="text-xs font-normal text-slate-400">Max 5MB</span>
            </label>

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
              >
                <FileImage className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Click to upload or take a photo of the defect
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WEBP</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Defect Preview"
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[150px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  File Complaint
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
