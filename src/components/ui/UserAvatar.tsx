'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({
  firstName,
  lastName,
  email,
  imageUrl,
  size = 'md',
  className,
}: UserAvatarProps) {
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  if (imageUrl) {
    return (
      <div
        className={cn(
          'relative inline-flex items-center justify-center rounded-full overflow-hidden',
          'bg-taupe-light',
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={imageUrl}
          alt={`${firstName} ${lastName}`}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'bg-gradient-to-br from-accent-gold to-accent-burgundy',
        'text-warmwhite font-semibold',
        sizeClasses[size],
        className
      )}
    >
      {getInitials()}
    </div>
  );
}
