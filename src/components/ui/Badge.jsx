export default function Badge({ children, tone = 'muted', className = '' }) {
  const tones = {
    muted:
      'bg-secondary-muted text-ink-900 ring-1 ring-secondary/80 dark:bg-ink-800 dark:text-parchment-100 dark:ring-ink-600',
    accent:
      'bg-accent-subtle text-accent-dark ring-2 ring-accent/50 dark:bg-accent-dark/35 dark:text-accent-subtle dark:ring-accent/45',
    success:
      'bg-emerald-100/85 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
