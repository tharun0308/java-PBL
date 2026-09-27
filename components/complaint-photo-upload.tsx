'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { motion, AnimatePresence } from 'framer-motion';

interface ComplaintPhotoUploadProps {
  photoPaths: string[];
  onChange: (paths: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export function ComplaintPhotoUpload({
  photoPaths = [],
  onChange,
  maxPhotos = 3,
  disabled = false,
}: ComplaintPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const availableSlots = maxPhotos - photoPaths.length;
    if (fileArray.length > availableSlots) {
      toast.warning(`You can attach up to ${maxPhotos} photos (${availableSlots} slot${availableSlots > 1 ? 's' : ''} remaining).`);
    }

    const filesToUpload = fileArray.slice(0, availableSlots);
    setIsUploading(true);

    let currentPaths = [...photoPaths];

    try {
      for (const file of filesToUpload) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File Too Large', {
            description: `${file.name} must be under 5MB.`,
          });
          continue;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type.toLowerCase())) {
          toast.error('Invalid Format', {
            description: `${file.name}: Only JPG, PNG, and WEBP images are supported.`,
          });
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetchWithAuth('/api/complaints/upload-photo', {
          method: 'POST',
          body: formData,
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(json.error || `Failed to upload ${file.name}`);
        }

        const filename = json.data?.filename;
        if (filename) {
          currentPaths = [...currentPaths, filename];
          onChange(currentPaths);
        }
      }

      if (currentPaths.length > photoPaths.length) {
        toast.success('Photos Attached', {
          description: `${currentPaths.length} of ${maxPhotos} photos attached successfully.`,
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        });
      }
    } catch (err: any) {
      toast.error('Upload Failed', {
        description: err.message || 'Could not upload photo. Please try again.',
        icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = photoPaths.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    toast.info('Photo removed');
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) handleFilesSelected(e.target.files);
        }}
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        disabled={disabled || isUploading || photoPaths.length >= maxPhotos}
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e) => {
          if (e.target.files) handleFilesSelected(e.target.files);
        }}
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        disabled={disabled || isUploading || photoPaths.length >= maxPhotos}
      />

      {/* Action Header & Upload Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal">
            <Camera className="w-3.5 h-3.5 text-lavender" />
            <span>Attach Defect Photos <span className="text-slate font-normal font-mono text-[11px]">(Optional)</span></span>
          </div>
          <p className="text-[12px] text-slate mt-0.5">
            Attach photo proof of the maintenance defect (up to {maxPhotos} photos, max 5MB each).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {photoPaths.length < maxPhotos && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="h-8 px-3 rounded-lg text-xs font-medium border-border hover:border-lavender/50 text-charcoal bg-white"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-lavender" />
                ) : (
                  <Upload className="w-3.5 h-3.5 mr-1.5 text-lavender" />
                )}
                <span>Choose Photo</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="h-8 px-3 rounded-lg text-xs font-medium border-border hover:border-lavender/50 text-charcoal bg-white"
              >
                <Camera className="w-3.5 h-3.5 mr-1.5 text-lavender" />
                <span>Take Photo</span>
              </Button>
            </>
          )}

          <span className="text-[11px] font-mono text-slate bg-cream-card px-2 py-1 rounded-md border border-border">
            {photoPaths.length} / {maxPhotos}
          </span>
        </div>
      </div>

      {/* Photo Preview Grid */}
      {photoPaths.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {photoPaths.map((filename, idx) => (
            <motion.div
              key={filename}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative group rounded-xl overflow-hidden border border-border bg-charcoal/5 aspect-[4/3] flex items-center justify-center shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/complaints/photos/${filename}`}
                alt={`Defect photo ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                onClick={() => setPreviewPhoto(filename)}
              />

              {/* Top Badge */}
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-charcoal/75 backdrop-blur-xs text-white text-[10px] font-mono font-medium">
                Photo {idx + 1}
              </div>

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(filename)}
                  className="p-1.5 rounded-full bg-white/90 text-charcoal hover:bg-white transition-colors cursor-pointer shadow-sm"
                  title="View full image"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer shadow-sm"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Full-size Image Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-xs p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 bg-cream-card border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal">Defect Photo Preview</span>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1 rounded-lg text-slate hover:text-charcoal hover:bg-charcoal/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 flex items-center justify-center bg-charcoal/5 max-h-[75vh] overflow-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/complaints/photos/${previewPhoto}`}
                  alt="Defect preview full"
                  className="max-h-[70vh] w-auto object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
