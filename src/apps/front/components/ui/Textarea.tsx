import { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className = '', id, ...props }, ref) => {
    const areaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={areaId} className="text-sm font-medium text-gray-600">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={[
            'w-full rounded-lg border px-4 py-2.5 text-sm font-medium outline-none transition-all resize-none',
            'placeholder:text-gray-400 text-gray-800',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50',
            error
              ? 'border-red-400 bg-white focus:ring-2 focus:ring-red-400/20 focus:border-red-500'
              : 'border-gray-200 bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600',
            className,
          ].join(' ')}
          {...props}
        />
        {error && !hint && <p className="text-xs font-medium text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
