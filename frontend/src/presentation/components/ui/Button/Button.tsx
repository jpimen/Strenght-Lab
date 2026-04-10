import React from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Show loading state and disable interaction */
  isLoading?: boolean;
  /** Icon to display in button */
  icon?: React.ReactNode;
  /** Position of icon relative to text */
  iconPosition?: 'left' | 'right';
  /** Make button full width */
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-iron-red text-white hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50',
  secondary:
    'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm active:scale-95 disabled:opacity-50',
  outline:
    'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:scale-95 disabled:opacity-50',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-50',
  destructive:
    'bg-error-red text-white hover:bg-red-700 hover:shadow-lg active:scale-95 disabled:opacity-50',
  success:
    'bg-success-green text-white hover:bg-green-700 hover:shadow-lg active:scale-95 disabled:opacity-50',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'py-1.5 px-3 text-xs',
  sm: 'py-2.5 px-4 text-sm',
  md: 'py-3 px-6 text-base',
  lg: 'py-4 px-8 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          // Base styles
          'font-bold uppercase tracking-wider transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-iron-red focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none',
          'inline-flex items-center justify-center gap-2',
          // Variants and sizes
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {icon && iconPosition === 'left' && !isLoading && icon}
        {children}
        {icon && iconPosition === 'right' && !isLoading && icon}
      </button>
    );
  },
);

Button.displayName = 'Button';
