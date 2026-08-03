import React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const buttonVariants: Record<ButtonVariant, string> = {
  default: 'bg-atlassian-brand text-white shadow-sm hover:bg-atlassian-brandHover',
  secondary: 'bg-atlassian-bg text-atlassian-text hover:bg-atlassian-border dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
  outline: 'border border-atlassian-border bg-white/70 text-atlassian-text shadow-sm hover:bg-white dark:border-atlassian-darkBorder dark:bg-atlassian-darkSurface dark:text-white dark:hover:bg-atlassian-darkBorder',
  ghost: 'text-atlassian-subtext hover:bg-atlassian-bg hover:text-atlassian-text dark:text-atlassian-darkSubtext dark:hover:bg-white/10 dark:hover:text-white',
  destructive: 'bg-atlassian-error text-white shadow-sm hover:bg-atlassian-error/90',
  link: 'h-auto p-0 text-atlassian-brand underline-offset-4 hover:underline',
};

const buttonSizes: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2 text-xs',
  sm: 'h-9 px-3 text-[11px]',
  lg: 'h-11 px-6 text-sm',
  icon: 'h-10 w-10',
  'icon-sm': 'h-8 w-8',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-slot="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-bold uppercase tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlassian-brand/30 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-atlassian-darkBg',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = 'Button';
