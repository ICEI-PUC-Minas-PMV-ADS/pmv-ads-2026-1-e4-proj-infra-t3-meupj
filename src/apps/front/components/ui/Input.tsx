import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputSize?: InputSize;
  /** Se true, aplica estilo de campo somente-leitura (fundo cinza) */
  readOnlyStyle?: boolean;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      inputSize = 'md',
      readOnlyStyle = false,
      className = '',
      id,
      readOnly,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isReadOnly = readOnly || readOnlyStyle;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-600"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            readOnly={isReadOnly}
            className={[
              'w-full rounded-lg border outline-none transition-all font-medium',
              sizeClasses[inputSize],
              leftIcon  ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              isReadOnly
                ? 'border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed'
                : error
                  ? 'border-red-400 bg-white text-gray-800 focus:ring-2 focus:ring-red-400/20 focus:border-red-500'
                  : 'border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600',
              'placeholder:text-gray-400',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50',
              className,
            ].join(' ')}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-0 pr-3.5 flex items-center text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && !hint && (
          <p className="text-xs font-medium text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-400">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
