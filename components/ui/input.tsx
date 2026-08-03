import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      data-slot="input"
      className={cn(
        'h-10 w-full rounded-lg border border-atlassian-border bg-atlassian-bg/60 px-4 text-sm text-atlassian-text outline-none transition-all',
        'placeholder:text-atlassian-subtext/60 focus:border-transparent focus:ring-2 focus:ring-atlassian-brand/30',
        'dark:border-atlassian-darkBorder dark:bg-atlassian-darkBg/70 dark:text-white dark:placeholder:text-atlassian-darkSubtext',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';
