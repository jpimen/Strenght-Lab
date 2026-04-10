import React from 'react';
import clsx from 'clsx';

export type CardVariant = 'default' | 'elevated' | 'bordered' | 'outlined';
type PaddingVariant = 'compact' | 'default' | 'spacious';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the card */
  variant?: CardVariant;
  /** Padding inside the card */
  padding?: PaddingVariant;
  /** Border color for left-border accent */
  borderColor?: 'iron-red' | 'success' | 'warning' | 'error' | 'info' | 'none';
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-200 shadow-elevate-1',
  elevated: 'bg-white shadow-elevate-2 border border-gray-100',
  bordered: 'bg-white border border-gray-200',
  outlined: 'bg-white border-2 border-gray-200',
};

const paddingStyles: Record<PaddingVariant, string> = {
  compact: 'p-4',
  default: 'p-6',
  spacious: 'p-8',
};

const borderColorStyles: Record<string, string> = {
  'iron-red': 'border-l-4 border-l-iron-red',
  success: 'border-l-4 border-l-success-green',
  warning: 'border-l-4 border-l-warning-yellow',
  error: 'border-l-4 border-l-error-red',
  info: 'border-l-4 border-l-info-blue',
  none: '',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'default',
      borderColor,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          // Base styles
          'relative rounded-lg transition-all duration-300 ease-out',
          'hover:shadow-elevate-2 hover:-translate-y-1',
          // Variants
          variantStyles[variant],
          // Padding
          paddingStyles[padding],
          // Border accent
          borderColor && borderColorStyles[borderColor],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
