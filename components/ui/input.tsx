import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-body placeholder:text-slate transition-all duration-200 focus:border-lavender focus:bg-surface focus:outline-none focus:ring-2 focus:ring-lavender/30 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-slate disabled:border-border disabled:opacity-75 shadow-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
