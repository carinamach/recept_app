const variants = {
  primary:
    'bg-primary text-white shadow-float hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2',
  secondary:
    'bg-secondary text-ink-900 shadow-sm ring-1 ring-ink-300/80 hover:bg-secondary-muted hover:shadow-card dark:bg-ink-800 dark:text-parchment-100 dark:ring-ink-600',
  ghost: 'text-ink-800 hover:bg-secondary-muted dark:text-parchment-200 dark:hover:bg-ink-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400',
};

const sizes = {
  sm: 'rounded-full px-3 py-1.5 text-xs font-semibold',
  md: 'rounded-full px-4 py-2 text-sm font-semibold',
  lg: 'rounded-full px-5 py-3 text-[0.925rem] font-semibold tracking-tight',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'inline-flex cursor-pointer items-center justify-center gap-2 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-50 dark:focus-visible:ring-offset-ink-950',
        'disabled:pointer-events-none disabled:opacity-45',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ]
        .join(' ')
        .trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
