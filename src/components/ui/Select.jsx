export default function Select({ label, id, children, error, className = '', ...rest }) {
  const sid = id ?? rest.name;
  return (
    <label className={`block ${className}`} htmlFor={sid}>
      {label && (
        <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-800 dark:text-parchment-200">
          {label}
        </span>
      )}
      <div className="relative">
        <select
          id={sid}
          className="w-full appearance-none rounded-2xl border border-ink-300 bg-parchment-50 px-4 py-3 pr-10 text-sm font-semibold text-ink-900 shadow-sm outline-none transition-[box-shadow,transform,border-color] hover:border-accent/40 focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_rgb(129_178_154/0.35)] dark:border-ink-600 dark:bg-ink-800 dark:text-parchment-50 dark:focus-visible:border-accent"
          {...rest}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-700 dark:text-parchment-200">
          ⌄
        </span>
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}
