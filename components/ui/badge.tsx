import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
        secondary: 'border-slate-700 bg-slate-800/80 text-slate-300',
        destructive: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
        outline: 'border-slate-700 text-slate-300',
        success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        info: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
        cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
