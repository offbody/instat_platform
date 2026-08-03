import React from 'react';
import { cn } from '../../lib/utils';

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="tabs-list"
      className={cn('inline-flex flex-wrap items-center gap-1 rounded-lg bg-atlassian-bg p-1 dark:bg-atlassian-darkBg', className)}
      {...props}
    />
  )
);

TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ active, className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-slot="tabs-trigger"
      data-state={active ? 'active' : 'inactive'}
      className={cn(
        'inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-[11px] font-bold uppercase tracking-wide transition-all',
        active
          ? 'bg-white text-atlassian-text shadow-sm dark:bg-atlassian-darkSurface dark:text-white'
          : 'text-atlassian-subtext hover:text-atlassian-text dark:text-atlassian-darkSubtext dark:hover:text-white',
        className
      )}
      {...props}
    />
  )
);

TabsTrigger.displayName = 'TabsTrigger';
