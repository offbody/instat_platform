import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'info' | 'warning' | 'muted';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-atlassian-brand/10 text-atlassian-brand',
  success: 'bg-[#DCFCE7] text-[#166534] dark:bg-[#14532D] dark:text-[#BBF7D0]',
  info: 'bg-[#DDEAFE] text-[#1E40AF] dark:bg-[#1E3A8A] dark:text-[#93C5FD]',
  warning: 'bg-atlassian-warning/15 text-[#8A5A00] dark:text-atlassian-warning',
  muted: 'bg-[#E5E7EB] text-[#374151] dark:bg-[#374151] dark:text-[#D1D5DB]',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      data-slot="badge"
      className={cn('inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide', badgeVariants[variant], className)}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';
