import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-body placeholder:text-slate focus:border-lavender focus:bg-surface focus:outline-none focus:ring-2 focus:ring-lavender/30 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-slate disabled:border-border disabled:opacity-75 shadow-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
