import { z } from 'zod';
import { CATEGORIES, PRIORITIES, STATUSES } from '../constants';

export const complaintCreateSchema = z.object({
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid department category' }),
  }),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(255, 'Location cannot exceed 255 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  priority: z.enum(PRIORITIES, {
    errorMap: () => ({ message: 'Please select a valid priority (LOW, MEDIUM, HIGH)' }),
  }),
  image_url: z.string().optional().nullable(),
});

export type ComplaintCreateInput = z.infer<typeof complaintCreateSchema>;

export const complaintStatusUpdateSchema = z.object({
  status: z.enum(STATUSES, {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
  assigned_to: z.string().nullable().optional(),
  resolution_note: z.string().nullable().optional(),
  resolution_image_url: z.string().nullable().optional(),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
});

export type ComplaintStatusUpdateInput = z.infer<typeof complaintStatusUpdateSchema>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name cannot exceed 80 characters'),
  email: z.string().email('Please enter a valid email address'),
  userTitle: z.enum(['Student', 'Teacher']).optional().default('Student'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
