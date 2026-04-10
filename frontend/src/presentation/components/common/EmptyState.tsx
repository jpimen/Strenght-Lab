import React from 'react';
import clsx from 'clsx';

interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional className */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className,
      )}
    >
      {icon && <div className="mb-4 text-gray-400 text-5xl">{icon}</div>}
      <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
        {title}
      </h3>
      {description && <p className="text-gray-600 mb-6 max-w-md">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-iron-red text-white font-bold uppercase text-sm tracking-wider transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-iron-red focus:ring-offset-2 rounded-md"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
