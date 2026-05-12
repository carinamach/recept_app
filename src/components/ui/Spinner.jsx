export default function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center" role="status">
      <div className="h-11 w-11 animate-spin rounded-full border-4 border-primary/20 border-t-primary shadow-inner dark:border-primary/15 dark:border-t-primary-muted" />
      <p className="text-sm font-semibold text-ink-800 dark:text-parchment-100">{label}</p>
    </div>
  );
}
