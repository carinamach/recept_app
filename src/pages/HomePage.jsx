import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import RecipeCard from '@/components/recipes/RecipeCard';
import CategoryFilters from '@/components/search/CategoryFilters';
import SearchBar from '@/components/search/SearchBar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { CATEGORY_LABELS } from '@/constants/categories';
import { useRecipes } from '@/context/RecipeContext';
import { useDebounce } from '@/hooks/useDebounce';
import { loadRecentEntries } from '@/services/recentlyViewed';

/** @typedef {import('@/constants/categories').RecipeCategory|null} Cat */

export default function HomePage() {
  const {
    recipes,
    loading,
    error,
    saving,
    hydrate,
    toggleFavorite,
    downloadJson,
    resetToSeed,
    importFromDisk,
    getRecipeById,
  } = useRecipes();

  const [query, setQuery] = useState('');
  /** @type {[Cat, (c: Cat) => void]} */
  const [category, setCategory] = useState(/** @type {Cat} */ (null));
  const debouncedQuery = useDebounce(query.trim().toLowerCase(), 260);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (category && r.category !== category) return false;
      if (!debouncedQuery) return true;
      const blob = `${r.title} ${r.description} ${(r.ingredients ?? [])
        .map((i) => `${i.amount} ${i.name}`)
        .join(' ')}`.toLowerCase();
      return blob.includes(debouncedQuery);
    });
  }, [recipes, category, debouncedQuery]);

  const favorites = useMemo(() => recipes.filter((r) => r.favorited), [recipes]);
  const showFavoritesRail = favorites.length > 0 && debouncedQuery === '' && category === null;

  const recentlyViewed = useMemo(() => {
    return loadRecentEntries()
      .map((entry) => getRecipeById(entry.id))
      .filter(Boolean)
      .slice(0, 4);
  }, [recipes, getRecipeById]);

  if (loading) return <Spinner label="Stirring flavors…" />;
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
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-parchment-100 via-parchment-50 to-parchment-200/90 px-6 py-10 shadow-card ring-1 ring-parchment-400/80 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950 dark:ring-ink-700 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-24 h-60 w-60 rounded-full bg-primary/15 blur-3xl dark:bg-primary/12" />
        <div className="pointer-events-none absolute -left-24 bottom-[-4rem] h-64 w-64 rounded-full bg-secondary/55 blur-3xl dark:bg-ink-800/65" />

        <div className="relative mx-auto flex max-w-2xl flex-col gap-8 text-center">
          <span className="mx-auto rounded-full border border-secondary bg-surface px-3 py-[0.25rem] text-[0.65rem] font-bold uppercase tracking-[0.34em] text-ink-900 shadow-sm ring-1 ring-primary/20 dark:border-ink-600 dark:bg-ink-800 dark:text-parchment-50 dark:ring-accent/35">
            Curated cravings
          </span>
          <h1 className="font-display text-balance text-[2.06rem] leading-[1.12] tracking-[-0.03em] text-ink-900 dark:text-white sm:text-[2.63rem]">
            A quiet cookbook for bold weeknights & slow mornings.
          </h1>
          <p className="text-[0.98rem] leading-relaxed text-ink-800 dark:text-parchment-100">
            Scroll like Pinterest, plate like your favorite Taipei night market stall — minimalist cards, luscious photos,
            tactile shadows.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-ink-800 dark:text-parchment-200">
            <span>{filtered.length}</span>
            <span aria-hidden>/</span>
            <span>match your filters · {recipes.length} total</span>
            {saving && (
              <>
                <span aria-hidden>/</span>
                <span className="animate-pulse">Saving JSON…</span>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.92fr)]">
        <Card>
          <SearchBar value={query} onChange={setQuery} />
          <div className="mt-6">
            <CategoryFilters selected={category} onChange={setCategory} />
          </div>

          <div className="mt-7 grid gap-2 border-t border-parchment-400 pt-5 text-[0.8rem] text-ink-800 dark:border-ink-600 dark:text-parchment-100 sm:grid-cols-3">
            <Link to="/recipes/new" className="font-semibold text-primary underline-offset-2 hover:underline dark:text-primary-muted">
              Compose new recipe +
            </Link>
            <button
              type="button"
              className="cursor-pointer text-left font-semibold text-primary underline-offset-2 hover:underline dark:text-primary-muted"
              onClick={() => resetToSeed()}
            >
              Reset to seed bundle
            </button>
            <button
              type="button"
              className="cursor-pointer text-left font-semibold text-primary underline-offset-2 hover:underline dark:text-primary-muted"
              onClick={downloadJson}
            >
              Download JSON archive
            </button>
          </div>
          <label className="mt-4 block cursor-pointer text-[0.8rem] font-semibold text-ink-800 underline-offset-2 hover:text-primary-hover hover:underline dark:text-parchment-100 dark:hover:text-primary-muted">
            <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importFromDisk(f);
              e.target.value = '';
            }} />
            Replace from JSON file →
          </label>
          <p className="mt-4 text-[0.72rem] leading-relaxed text-ink-800 dark:text-parchment-100">
            With <code className="rounded bg-parchment-200 px-1 font-mono text-[0.68rem] dark:bg-ink-800">npm run dev</code>, recipes save to{' '}
            <code className="rounded bg-parchment-200 px-[0.2rem] py-[0.02rem] font-mono text-[0.68rem] font-medium text-ink-900 ring-1 ring-parchment-400/85 dark:bg-ink-800 dark:text-parchment-100 dark:ring-ink-600">
              data/recipes.json
            </code>{' '}
            via the local API; the browser also keeps a LocalStorage copy as backup.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-[1.15rem] text-ink-900 dark:text-white">Recently viewed</h2>
          <p className="mt-1 text-sm text-ink-800 dark:text-parchment-100">
            Kept locally so you can jump back mid-grocery run.
          </p>
          {recentlyViewed.length === 0 ? (
            <p className="mt-5 text-sm text-ink-800 dark:text-parchment-100">Open a recipe and it will land here.</p>
          ) : (
            <ul className="mt-5 space-y-3 text-sm">
              {recentlyViewed.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/recipes/${r.id}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-parchment-400/85 bg-parchment-100 px-3 py-2.5 transition hover:bg-parchment-200 dark:border-ink-600 dark:bg-ink-950 dark:hover:bg-ink-900"
                  >
                    <span className="font-semibold text-ink-900 group-hover:text-primary-hover dark:text-parchment-50 dark:group-hover:text-primary-muted">
                      {r.title}
                    </span>
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-800 dark:text-parchment-200">
                      Open
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {showFavoritesRail && (
        <section aria-label="Favorite recipes">
          <div className="mb-4 flex items-end justify-between gap-3 px-1">
            <div>
              <h2 className="font-display text-[1.4rem] text-ink-900 dark:text-white">Saved for softer days</h2>
              <p className="text-sm text-ink-800 dark:text-parchment-100">Quick return to bowls you crave again.</p>
            </div>
          </div>
          <div className="grid-masonry-ish">
            {favorites.map((r) => (
              <RecipeCard key={r.id} recipe={r} onToggleFavorite={() => toggleFavorite(r.id)} />
            ))}
          </div>
        </section>
      )}

      <section aria-label="All recipes">
        <div className="mb-4 flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="font-display text-[1.4rem] text-ink-900 dark:text-white">All recipes</h2>
            <p className="text-sm text-ink-800 dark:text-parchment-100">
              {category ? `Filtered: ${CATEGORY_LABELS[category]}` : 'Every idea in your journal.'}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="text-center">
            <p className="text-sm text-ink-800 dark:text-parchment-100">
              Nothing matches — loosen filters or create something new.
            </p>
            <Link to="/recipes/new" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline dark:text-primary-muted">
              Start a blank recipe +
            </Link>
          </Card>
        ) : (
          <div className="grid-masonry-ish">
            {filtered.map((r) => (
              <RecipeCard key={r.id} recipe={r} onToggleFavorite={() => toggleFavorite(r.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
