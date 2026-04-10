import React from 'react';
import clsx from 'clsx';

export type SkeletonVariant = 'text' | 'avatar' | 'card' | 'line' | 'circle';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Type of skeleton to display */
  variant?: SkeletonVariant;
  /** How many lines to show (for text variant) */
  lines?: number;
  /** Custom width */
  width?: string | number;
  /** Custom height */
  height?: string | number;
}

export function Skeleton({
  variant = 'text',
  lines = 3,
  width,
  height,
  className,
  ...props
}: SkeletonProps) {
  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'h-4 bg-gray-200 rounded-md animate-pulse',
              i === lines - 1 && 'w-3/4', // Last line shorter
              className,
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div
        className={clsx(
          'w-12 h-12 bg-gray-200 rounded-full animate-pulse',
          className,
        )}
        {...props}
      />
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={clsx(
          'rounded-full bg-gray-200 animate-pulse',
          className,
        )}
        style={{
          width: width || '40px',
          height: height || '40px',
        }}
        {...props}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={clsx(
          'bg-white border border-gray-200 rounded-lg p-6 space-y-4 animate-pulse',
          className,
        )}
        {...props}
      >
        <div className="h-6 bg-gray-200 rounded-md w-1/3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-md" />
          <div className="h-4 bg-gray-200 rounded-md w-5/6" />
        </div>
        <div className="flex gap-2 pt-4">
          <div className="h-10 bg-gray-200 rounded-md w-1/4" />
          <div className="h-10 bg-gray-200 rounded-md w-1/4" />
        </div>
      </div>
    );
  }

  // Default: line
  return (
    <div
      className={clsx('bg-gray-200 rounded-md animate-pulse', className)}
      style={{
        width: width || '100%',
        height: height || '16px',
      }}
      {...props}
    />
  );
}

Skeleton.displayName = 'Skeleton';
