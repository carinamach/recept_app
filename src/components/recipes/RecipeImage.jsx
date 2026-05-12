/** @typedef {import('@/types/recipe').Recipe} Recipe */

/** @param {{ recipe: Pick<Recipe, 'imageUrl'|'imageDataUrl'|'title'>, aspect?: string, rounded?: string, lazy?: boolean }} props */
export default function RecipeImage({ recipe, aspect = 'aspect-[4/5]', rounded = 'rounded-[1.85rem]', lazy = true }) {
  const src = recipe.imageDataUrl || recipe.imageUrl;
  const hasImage = Boolean(src);

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br from-parchment-200 via-parchment-50 to-parchment-100 shadow-inner ring-1 ring-parchment-400/85 dark:from-ink-800 dark:to-ink-950 dark:ring-ink-600 ${aspect} ${rounded}`}
    >
      {hasImage ? (
        <img
          src={/** @type {string} */ (src)}
          alt={recipe.title}
          loading={lazy ? 'lazy' : 'eager'}
          className="h-full w-full object-cover transition-transform duration-[1.05s] ease-out group-hover:scale-[1.025]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center text-sm font-medium text-ink-800 dark:text-parchment-100">
          No image yet
        </div>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/55 ring-inset dark:ring-ink-700/65"
      />
    </div>
  );
}
