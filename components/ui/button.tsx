import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:bg-surface-muted disabled:text-slate disabled:border-border disabled:opacity-80 disabled:shadow-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-charcoal text-white shadow-sm hover:bg-charcoal-hover border border-charcoal',
        glow:
          'bg-lavender text-charcoal font-semibold shadow-sm hover:bg-lavender-hover border border-lavender/60',
        cyan:
          'bg-mint text-charcoal font-semibold shadow-sm hover:bg-mint/90 border border-mint/60',
        destructive:
          'bg-danger text-white shadow-sm hover:bg-danger/90 border border-danger/30',
        outline:
          'border border-border bg-surface text-charcoal hover:bg-surface-muted hover:border-slate-300 shadow-sm',
        secondary:
          'bg-lavender-soft text-charcoal hover:bg-lavender/30 border border-lavender-soft font-medium',
        ghost:
          'text-slate hover:bg-surface-muted hover:text-charcoal',
        link:
          'text-lavender-strong underline-offset-4 hover:underline hover:text-lavender-hover p-0 h-auto font-medium',
        glass:
          'glass-card text-charcoal hover:bg-white hover:border-lavender shadow-sm',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base font-medium',
        xl: 'h-14 rounded-2xl px-8 text-lg font-semibold',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
