import { useMemo, useState } from 'react';

import RecipeCard from '@/components/recipes/RecipeCard';
import CategoryFilters from '@/components/search/CategoryFilters';
import SearchBar from '@/components/search/SearchBar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { CATEGORY_LABELS } from '@/constants/categories';
import { useRecipes } from '@/context/RecipeContext';
import { useDebounce } from '@/hooks/useDebounce';

/** @typedef {import('@/constants/categories').RecipeCategory|null} Cat */

export default function AllRecipesPage() {
  const { recipes, loading, error, toggleFavorite, hydrate } = useRecipes();

  const [query, setQuery] = useState('');
  /** @type {[Cat, (c: Cat) => void]} */
  const [category, setCategory] = useState(/** @type {Cat} */ (null));
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const debouncedQuery = useDebounce(query.trim().toLowerCase(), 260);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (favoritesOnly && !r.favorited) return false;
      if (category && r.category !== category) return false;
      if (!debouncedQuery) return true;
      const blob = `${r.title} ${r.description} ${(r.ingredients ?? [])
        .map((i) => `${i.amount} ${i.name}`)
        .join(' ')}`.toLowerCase();
      return blob.includes(debouncedQuery);
    });
  }, [recipes, category, debouncedQuery, favoritesOnly]);

  if (loading) return <Spinner label="Loading recipes…" />;
  if (error) {
    return (
      <Card className="text-center">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
        <Button type="button" className="mt-4" onClick={hydrate}>
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <header className="px-1">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.34em] text-primary dark:text-primary-muted">
          Library
        </span>
        <h1 className="font-display mt-3 text-[1.97rem] tracking-[-0.03em] text-ink-900 dark:text-white">All recipes</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-800 dark:text-parchment-100">
          Search and filter your whole collection — {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} in the journal.
        </p>
      </header>

      <Card>
        <SearchBar value={query} onChange={setQuery} />
        <div className="mt-6">
          <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-800 dark:text-parchment-200">
            Category
          </p>
          <CategoryFilters selected={category} onChange={setCategory} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-parchment-300 pt-6 dark:border-ink-700">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-900 dark:text-parchment-50">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-2 border-ink-600 text-primary focus:ring-2 focus:ring-accent dark:border-parchment-500"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            Favorites only
          </label>
          <span className="text-sm text-ink-800 dark:text-parchment-200">
            Showing <strong>{filtered.length}</strong>
            {category ? (
              <>
                {' '}
                in <strong>{CATEGORY_LABELS[category]}</strong>
              </>
            ) : null}
          </span>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-ink-800 dark:text-parchment-100">
            No recipes match — try another search or filter.
          </p>
        </Card>
      ) : (
        <section aria-label="Filtered recipes" className="grid-masonry-ish">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} onToggleFavorite={() => toggleFavorite(r.id)} />
          ))}
        </section>
      )}
    </div>
  );
}
