import { Link } from 'react-router-dom';

import { CATEGORY_LABELS } from '@/constants/categories';

import RecipeImage from '@/components/recipes/RecipeImage';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

/** @typedef {import('@/types/recipe').Recipe} Recipe */

/** @param {{ recipe: Recipe, onToggleFavorite: (id: string) => void }} props */
export default function RecipeCard({ recipe, onToggleFavorite }) {
  const categoryLabel = CATEGORY_LABELS[recipe.category] ?? recipe.category;

  return (
    <article className="group relative flex animate-fade-up flex-col">
      <div className="absolute right-5 top-[1.05rem] z-[1] opacity-95">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="!rounded-2xl !px-3 !shadow-card !backdrop-blur"
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate?.(18);
            onToggleFavorite(recipe.id);
          }}
          aria-pressed={recipe.favorited}
          aria-label={recipe.favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {recipe.favorited ? '★' : '☆'}
        </Button>
      </div>

      <Link
        to={`/recipes/${recipe.id}`}
        className="block overflow-hidden rounded-[1.95rem] border border-ink-200/90 bg-surface shadow-card ring-1 ring-ink-200/70 transition-[transform,box-shadow] duration-[0.75s] ease-out hover:-translate-y-[2px] hover:shadow-card-hover dark:border-ink-600 dark:bg-ink-900 dark:ring-black/35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/45"
      >
        <RecipeImage recipe={recipe} aspect="aspect-[16/17]" />

        <div className="space-y-2.5 p-5 sm:p-[1.15rem_1.55rem_1.45rem]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{categoryLabel}</Badge>
            {typeof recipe.ratingAverage === 'number' && (
              <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-800 dark:text-parchment-200">
                ★ {recipe.ratingAverage.toFixed(1)}
              </span>
            )}
          </div>
          <h2 className="font-display text-balance text-[1.125rem] leading-snug tracking-[-0.02em] text-ink-900 dark:text-white sm:text-[1.235rem]">
            {recipe.title}
          </h2>
          <p className="line-clamp-2 text-[0.9rem] leading-relaxed text-ink-800 dark:text-parchment-100">
            {recipe.description}
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-[0.75rem] font-semibold text-ink-800 dark:text-parchment-200">
            <span>{recipe.cookTimeMinutes} min</span>
            <span aria-hidden>/</span>
            <span>
              {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
