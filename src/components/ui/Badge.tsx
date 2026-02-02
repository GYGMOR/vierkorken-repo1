import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'gold';
}

export function Badge({ className, variant = 'secondary', ...props }: BadgeProps) {
  const variants = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    accent: 'badge-accent',
    gold: 'badge-gold',
  };

  return (
    <span
      className={cn('badge', variants[variant], className)}
      {...props}
    />
  );
}
