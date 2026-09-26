import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            'flex h-11 w-full appearance-none rounded-xl border border-border bg-surface px-3.5 py-2 pr-8 text-sm text-body focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-slate disabled:border-border disabled:opacity-75 shadow-sm',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
