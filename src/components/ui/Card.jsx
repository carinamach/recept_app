export default function Card({ children, className = '', padded = true }) {
  return (
    <div
      className={`rounded-[1.65rem] border border-ink-200/80 bg-surface shadow-card ring-1 ring-ink-200/60 transition-shadow duration-300 hover:shadow-card-hover dark:border-ink-700 dark:bg-ink-900 dark:ring-black/35 ${padded ? 'p-5 sm:p-7' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
