import { type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'indigo';
export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

// ─── Badge ────────────────────────────────────────────────────────────────────

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-600',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger:  'bg-red-50 text-red-600',
  info:    'bg-blue-50 text-blue-700',
  indigo:  'bg-indigo-100 text-indigo-700',
};

export function Badge({
  children,
  variant = 'default',
  dot = false,
  className = '',
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}) {
  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-gray-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger:  'bg-red-400',
    info:    'bg-blue-500',
    indigo:  'bg-indigo-500',
  };

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold',
        badgeVariants[variant],
        className,
      ].join(' ')}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────

const alertConfig: Record<AlertVariant, { icon: ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle className="h-5 w-5 flex-shrink-0" />,
    classes: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 flex-shrink-0" />,
    classes: 'bg-red-50 border-red-100 text-red-600',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 flex-shrink-0" />,
    classes: 'bg-amber-50 border-amber-100 text-amber-700',
  },
  info: {
    icon: <Info className="h-5 w-5 flex-shrink-0" />,
    classes: 'bg-blue-50 border-blue-100 text-blue-700',
  },
};

export function Alert({
  variant,
  children,
  className = '',
}: {
  variant: AlertVariant;
  children: ReactNode;
  className?: string;
}) {
  const { icon, classes } = alertConfig[variant];
  return (
    <div
      className={[
        'flex items-center gap-3 border p-4 rounded-xl text-sm',
        classes,
        className,
      ].join(' ')}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export function Toast({
  variant,
  message,
  onClose,
}: {
  variant: AlertVariant;
  message: string;
  onClose?: () => void;
}) {
  const { icon, classes } = alertConfig[variant];
  
  return (
    <div
      className={[
        'flex items-center gap-3 border p-4 rounded-xl text-sm shadow-lg animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-auto min-w-[300px]',
        classes,
      ].join(' ')}
    >
      {icon}
      <span className="flex-1 font-medium">{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          className="hover:opacity-70 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider({
  label,
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  if (!label) return <hr className={`border-gray-100 ${className}`} />;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <hr className="flex-1 border-gray-100" />
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <hr className="flex-1 border-gray-100" />
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={`animate-spin text-indigo-600 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
      {icon && <div className="text-gray-300">{icon}</div>}
      <div>
        <p className="text-base font-semibold text-gray-600">{title}</p>
        {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
