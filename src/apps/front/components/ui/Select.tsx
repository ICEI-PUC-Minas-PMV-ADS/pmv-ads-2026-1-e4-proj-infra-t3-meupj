import { forwardRef, type SelectHTMLAttributes } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  selectSize?: SelectSize;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const sizeClasses: Record<SelectSize, string> = {
  sm: 'pl-3 pr-8 py-1.5 text-xs',
  md: 'pl-4 pr-10 py-2.5 text-sm',
  lg: 'pl-4 pr-10 py-3 text-base',
};

// ─── ChevronIcon ──────────────────────────────────────────────────────────────

function ChevronDown({ size = 'md' }: { size?: SelectSize }) {
  const dim = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const offset = size === 'sm' ? 'right-2' : 'right-3';
  return (
    <div className={`pointer-events-none absolute inset-y-0 ${offset} flex items-center text-gray-400`}>
      <svg className={dim} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      hint,
      error,
      options,
      placeholder,
      selectSize = 'md',
      className = '',
      id,
      children,
      ...props
    },
    ref,
  ) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-600">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              'w-full appearance-none rounded-lg border outline-none transition-all font-medium cursor-pointer bg-white text-gray-800',
              sizeClasses[selectSize],
              error
                ? 'border-red-400 focus:ring-2 focus:ring-red-400/20 focus:border-red-500'
                : 'border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50',
              className,
            ].join(' ')}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown size={selectSize} />
        </div>

        {error && !hint && <p className="text-xs font-medium text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
