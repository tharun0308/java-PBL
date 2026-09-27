'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { StaffAdminRole, STAFF_ADMIN_ROLES } from '@/lib/types';
import {
  Upload,
  FileCheck,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
  AlertCircle,
  Building,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

interface StaffIdUploadProps {
  onDocumentUploaded: (documentPath: string) => void;
  onDepartmentChanged: (department: string) => void;
  onRoleChanged?: (role: StaffAdminRole) => void;
  onRoleOtherChanged?: (roleOther: string) => void;
  currentDocumentPath?: string;
  currentDepartment?: string;
  currentRole?: StaffAdminRole;
  currentRoleOther?: string;
  role?: StaffAdminRole | '';
  roleOther?: string;
  required?: boolean;
}

export function StaffIdUpload({
  onDocumentUploaded,
  onDepartmentChanged,
  onRoleChanged,
  onRoleOtherChanged,
  currentDocumentPath = '',
  currentDepartment = '',
  currentRole = 'PROFESSOR',
  currentRoleOther = '',
  role: controlledRole,
  roleOther: controlledRoleOther,
  required = true,
}: StaffIdUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [department, setDepartment] = useState(currentDepartment);
  const [internalRole, setInternalRole] = useState<StaffAdminRole | ''>(controlledRole || currentRole);
  const [internalRoleOther, setInternalRoleOther] = useState(controlledRoleOther || currentRoleOther);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState(currentDocumentPath);

  const role = controlledRole !== undefined ? controlledRole : internalRole;
  const roleOther = controlledRoleOther !== undefined ? controlledRoleOther : internalRoleOther;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File Too Large', {
        description: 'Employee ID proof must be 5MB or smaller.',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate type
    const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
    if (!hasValidExt) {
      toast.error('Invalid File Type', {
        description: 'Please upload an image (JPG, PNG) or PDF document.',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/user/upload-staff-document', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || 'Failed to upload Employee ID document.');
      }

      const docPath = json.data?.documentPath || json.documentPath;
      if (!docPath) {
        throw new Error('Server did not return a valid document path.');
      }

      setUploadedPath(docPath);
      onDocumentUploaded(docPath);
      toast.success('Employee ID Uploaded', {
        description: 'ID proof attached successfully.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading file';
      toast.error('Upload Failed', { description: msg });
      setSelectedFile(null);
      setUploadedPath('');
      onDocumentUploaded('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedPath('');
    onDocumentUploaded('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDepartmentChange = (val: string) => {
    setDepartment(val);
    onDepartmentChanged(val);
  };

  const handleRoleSelect = (selectedRole: StaffAdminRole) => {
    setInternalRole(selectedRole);
    if (onRoleChanged) {
      onRoleChanged(selectedRole);
    }
  };

  const handleRoleOtherChange = (val: string) => {
    setInternalRoleOther(val);
    if (onRoleOtherChanged) {
      onRoleOtherChanged(val);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isPdf = selectedFile?.name.toLowerCase().endsWith('.pdf') || uploadedPath.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-4 pt-2">
      {/* 1. Role / Hierarchy Selection (Required) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-lavender-strong" />
            <span>Staff / Administrative Role <span className="text-danger">*</span></span>
          </span>
          <span className="text-[10px] text-slate font-normal normal-case">Used for grievance escalation</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STAFF_ADMIN_ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => handleRoleSelect(r.value)}
              className={`px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                role === r.value
                  ? 'bg-pale-lavender border-lavender-strong text-charcoal ring-1 ring-lavender-strong shadow-sm font-semibold'
                  : 'bg-white border-border text-charcoal hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold leading-tight">{r.label}</div>
              <div className="text-[10px] text-slate mt-0.5 font-mono">Rank {r.rank}</div>
            </button>
          ))}
        </div>

        {/* Dynamic specification input if role is 'OTHER' */}
        {role === 'OTHER' && (
          <div className="pt-1.5 animate-in fade-in duration-200">
            <label className="block text-xs font-medium text-charcoal mb-1">
              Please specify role title <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="e.g. Lab Superintendent, Assistant Librarian..."
              value={roleOther}
              onChange={(e) => handleRoleOtherChange(e.target.value)}
              className="text-xs sm:text-sm bg-white border-border text-charcoal"
            />
          </div>
        )}
      </div>

      {/* 2. Department / Designation Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate" />
          <span>Department <span className="text-[10px] text-slate font-normal normal-case">(e.g. Computer Science, Electrical)</span></span>
        </label>
        <Input
          placeholder="e.g. Computer Science & Engineering"
          value={department}
          onChange={(e) => handleDepartmentChange(e.target.value)}
          className="text-xs sm:text-sm bg-white border-border text-charcoal"
        />
      </div>

      {/* 3. Employee ID File Upload */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-lavender-strong" />
            <span>Upload Employee ID Card {required && <span className="text-danger">*</span>}</span>
          </span>
          <span className="text-[10px] text-slate normal-case font-normal">JPG, PNG, PDF up to 5MB</span>
        </label>

        {uploadedPath || selectedFile ? (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-pale-lavender/50 border border-lavender/40 transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-pale-lavender border border-lavender/40 text-lavender-strong flex items-center justify-center shrink-0">
                {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
              </div>
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-xs font-semibold text-charcoal truncate">
                  {selectedFile ? selectedFile.name : uploadedPath}
                </span>
                <span className="text-[11px] text-lavender-strong flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  <span>
                    Attached {selectedFile ? `(${formatFileSize(selectedFile.size)})` : '• Ready for review'}
                  </span>
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-8 px-2 text-xs text-danger hover:bg-pale-danger rounded-lg shrink-0"
            >
              <X className="w-4 h-4 mr-1" />
              <span>Remove</span>
            </Button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="staff-id-file-input"
            />
            <label
              htmlFor="staff-id-file-input"
              className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isUploading
                  ? 'border-lavender bg-pale-lavender/30 opacity-75'
                  : 'border-border hover:border-lavender bg-surface-muted/60 hover:bg-pale-lavender/20'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-1">
                  <Loader2 className="w-6 h-6 text-lavender-strong animate-spin" />
                  <span className="text-xs font-semibold text-charcoal">Uploading ID Card...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-1 text-center">
                  <div className="w-10 h-10 rounded-xl bg-pale-lavender border border-lavender/40 text-lavender-strong flex items-center justify-center mb-1">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-charcoal">
                    Click or drag & drop Employee ID card
                  </span>
                  <span className="text-[11px] text-slate">
                    Clear photo or scanned PDF showing your name and faculty ID
                  </span>
                </div>
              )}
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
