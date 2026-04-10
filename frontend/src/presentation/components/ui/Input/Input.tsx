import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label to display above input */
  label?: string;
  /** Error message to display below input */
  error?: string;
  /** Hint text to display below input */
  hint?: string;
  /** Icon to display inside input (left side) */
  icon?: React.ReactNode;
  /** Mark field as required */
  required?: boolean;
  /** Wrapper className for container */
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      required,
      className,
      containerClassName,
      id,
      type = 'text',
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold uppercase tracking-wider text-gray-700"
          >
            {label}
            {required && <span className="text-error-red ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 flex items-center justify-center text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={clsx(
              // Base styles
              'w-full px-4 py-3 text-base font-normal',
              'bg-white border border-gray-200 text-gray-900',
              'transition-all duration-200 ease-out',
              // Focus state
              'focus:outline-none focus:ring-2 focus:ring-iron-red focus:ring-offset-0',
              'focus:border-iron-red focus:bg-white',
              // Hover state
              'hover:border-gray-300 hover:shadow-sm',
              // Error state
              error && 'border-error-red focus:ring-error-red focus:border-error-red',
              // Disabled state
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed opacity-60',
              // Icon padding
              icon && 'pl-10',
              // Border radius
              'rounded-md',
              className,
            )}
            {...props}
          />
        </div>

        {error && <p className="text-xs font-medium text-error-red">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-600">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
