import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import RecipeImage from '@/components/recipes/RecipeImage';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import { CATEGORY_LABELS } from '@/constants/categories';
import { useRecipes } from '@/context/RecipeContext';
import { pushRecentRecipe } from '@/services/recentlyViewed';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, getRecipeById, toggleFavorite, deleteRecipe, addComment, addRating } = useRecipes();

  const recipe = id ? getRecipeById(id) : null;

  const [stars, setStars] = useState(5);
  const [busyAction, setBusyAction] = useState(null);

  useEffect(() => {
    if (recipe?.id) {
      pushRecentRecipe(recipe.id);
    }
  }, [recipe?.id]);

  const commentsDesc = useMemo(() => [...(recipe?.comments ?? [])].reverse(), [recipe?.comments]);

  if (loading) return <Spinner label="Fetching recipe…" />;
  if (!recipe) {
    return (
      <Card className="text-center">
        <p className="text-sm text-ink-800 dark:text-parchment-100">This recipe vanished from your journal.</p>
        <Link to="/" className="mt-3 inline-flex text-sm font-semibold text-primary underline-offset-2 hover:underline dark:text-primary-muted">
          Browse all recipes →
        </Link>
      </Card>
    );
  }

  const categoryLabel = CATEGORY_LABELS[recipe.category] ?? recipe.category;

  async function submitRating() {
    setBusyAction('rating');
    try {
      await addRating(recipe.id, stars);
    } finally {
      setBusyAction(null);
    }
  }

  async function submitComment(/** @type {import('react').FormEvent<HTMLFormElement>} */ e) {
    e.preventDefault();
    const form = e.currentTarget;
    const author = /** @type {HTMLInputElement} */ (form.elements.namedItem('author')).value;
    const text = /** @type {HTMLTextAreaElement} */ (form.elements.namedItem('text')).value;
    setBusyAction('comment');
    try {
      await addComment(recipe.id, author, text);
      form.reset();
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="ghost" size="sm" className="self-start !px-0" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => toggleFavorite(recipe.id)}
            aria-pressed={recipe.favorited}
          >
            {recipe.favorited ? '★ Saved' : '☆ Save'}
          </Button>
          <Link to={`/recipes/${recipe.id}/edit`}>
            <Button type="button" variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={async () => {
              if (!window.confirm('Delete this recipe from your journal?')) return;
              await deleteRecipe(recipe.id);
              navigate('/', { replace: true });
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.88fr)] lg:items-start">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[2.3rem] bg-surface shadow-card ring-1 ring-ink-200/75 dark:bg-ink-800/90 dark:ring-ink-700">
            <RecipeImage recipe={recipe} aspect="aspect-[16/12] sm:aspect-[16/11]" rounded="rounded-none" lazy={false} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{categoryLabel}</Badge>
            {typeof recipe.ratingAverage === 'number' && (
              <span className="text-[0.75rem] font-semibold text-ink-800 dark:text-parchment-200">
                ★ {recipe.ratingAverage.toFixed(1)} · {recipe.ratingCount ?? 0} vote
                {(recipe.ratingCount ?? 0) === 1 ? '' : 's'}
              </span>
            )}
            <span className="text-[0.75rem] font-medium text-ink-700 dark:text-parchment-200">
              · {recipe.cookTimeMinutes} min · serves {recipe.servings}
            </span>
          </div>

          <h1 className="font-display text-balance text-[2rem] tracking-[-0.03em] text-ink-900 dark:text-white sm:text-[2.35rem]">
            {recipe.title}
          </h1>

          <p className="text-[1rem] leading-relaxed text-ink-800 dark:text-parchment-100">{recipe.description}</p>
        </div>

        <div className="space-y-5">
          <Card>
            <h2 id="ingredients-heading" className="font-display text-[1.2rem] text-ink-900 dark:text-white">
              Ingredients
            </h2>
            <ul
              role="list"
              aria-labelledby="ingredients-heading"
              className="mt-5 space-y-0 overflow-hidden rounded-[1.2rem] border-2 border-secondary bg-secondary-muted dark:border-accent/40 dark:bg-ink-950"
            >
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 border-b-2 border-secondary px-3 py-3.5 last:border-b-0 dark:border-ink-700"
                >
                  <span className="min-w-[5.85rem] max-w-[8.25rem] shrink-0 rounded-xl bg-ink-900 px-2.5 py-2 text-center text-[0.7rem] font-bold uppercase leading-snug tracking-wide text-surface dark:bg-secondary dark:text-ink-900">
                    {ing.amount || '—'}
                  </span>
                  <span className="min-w-0 flex-1 text-[0.95rem] font-medium leading-snug text-ink-900 dark:text-parchment-50">
                    {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="font-display text-[1.2rem] text-ink-900 dark:text-white">Method</h2>
            <ol className="mt-4 space-y-4">
              {recipe.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border-2 border-accent bg-accent-subtle text-[0.8rem] font-bold text-accent-dark dark:border-accent dark:bg-accent-dark/30 dark:text-accent-subtle">
                    {i + 1}
                  </span>
                  <p className="text-[0.95rem] leading-relaxed text-ink-900 dark:text-parchment-50">{s.text}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h2 className="font-display text-[1.1rem] text-ink-900 dark:text-white">Rate this bowl</h2>
            <p className="mt-2 text-xs leading-relaxed text-ink-800 dark:text-parchment-100">
              Your vote merges into an honest running average.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-800 dark:text-parchment-100">
                Stars
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={stars}
                  onChange={(e) => setStars(Number(e.target.value))}
                  className="w-44 accent-primary"
                />
              </label>
              <span className="text-sm font-bold text-ink-900 dark:text-parchment-50">{stars} / 5</span>
              <Button type="button" variant="primary" size="sm" disabled={busyAction !== null} onClick={submitRating}>
                {busyAction === 'rating' ? 'Saving…' : 'Submit rating'}
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-[1.1rem] text-ink-900 dark:text-white">Notes & chatter</h2>
            {commentsDesc.length === 0 ? (
              <p className="mt-3 text-sm text-ink-800 dark:text-parchment-100">
                Be the first to leave a handwritten note.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {commentsDesc.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-2xl border border-parchment-400/90 bg-parchment-100 px-4 py-3 text-sm dark:border-ink-600 dark:bg-ink-950"
                  >
                    <div className="flex items-center justify-between gap-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-800 dark:text-parchment-200">
                      <span>{c.author}</span>
                      <time dateTime={c.createdAt}>{new Date(c.createdAt).toLocaleString()}</time>
                    </div>
                    <p className="mt-2 leading-relaxed text-ink-900 dark:text-parchment-50">{c.text}</p>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={submitComment} className="mt-5 space-y-3">
              <Input label="Your name" name="author" placeholder="Sasha" autoComplete="nickname" />
              <Textarea label="Comment" name="text" rows={3} placeholder="What would you tweak next time?" required />
              <Button type="submit" variant="secondary" disabled={busyAction !== null}>
                {busyAction === 'comment' ? 'Posting…' : 'Post comment'}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
