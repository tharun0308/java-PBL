import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-lavender/40 bg-lavender-soft text-lavender-strong',
        secondary: 'border-border bg-surface-muted text-slate',
        destructive: 'border-[#FECDD3] bg-danger-soft text-danger',
        outline: 'border-border bg-surface text-charcoal',
        success: 'border-[#BBF7D0] bg-mint-soft text-mint-strong',
        warning: 'border-[#FDE68A] bg-warning-soft text-warning',
        info: 'border-lavender-soft bg-lavender-soft text-lavender-strong',
        cyan: 'border-mint/50 bg-mint-soft text-mint-strong',
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
