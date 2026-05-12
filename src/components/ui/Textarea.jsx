export default function Textarea({ label, id, error, rows = 4, className = '', ...rest }) {
  const tid = id ?? rest.name;
  return (
    <label className={`block ${className}`} htmlFor={tid}>
      {label && (
        <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-800 dark:text-parchment-200">
          {label}
        </span>
      )}
      <textarea
        id={tid}
        rows={rows}
        className="min-h-[6rem] w-full resize-y rounded-2xl border border-ink-300 bg-parchment-50 px-4 py-3 text-sm text-ink-900 shadow-sm outline-none transition-[box-shadow,transform,border-color] placeholder:text-ink-600 hover:border-accent/40 focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_rgb(129_178_154/0.35)] dark:border-ink-600 dark:bg-ink-800 dark:text-parchment-50 dark:placeholder:text-parchment-400 dark:focus-visible:border-accent"
        {...rest}
      />
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}
