import { useState } from 'react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import { useRecipes } from '@/context/RecipeContext';
import { fetchRecipeSuggestions } from '@/services/recipeAIService';

export default function SuggestionsPage() {
  const { recipes } = useRecipes();
  const [mood, setMood] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState(/** @type {string[]} */ ([]));
  const [error, setError] = useState(/** @type {string|null} */ (null));

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchRecipeSuggestions({ mood, ingredients, recipes });
      setIdeas(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach the idea engine');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-7">
      <header className="px-1">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.34em] text-primary dark:text-primary-muted">
          Soft AI
        </span>
        <h1 className="font-display mt-3 text-[1.97rem] tracking-[-0.03em] text-ink-900 dark:text-white">Recipe ideas</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-800 dark:text-parchment-100">
          This build ships a deterministic “AI-style” muse (no keys, no billing) — swap the service later for{' '}
          <code className="rounded bg-parchment-200 px-1 py-0.5 font-mono text-[0.7rem] font-medium text-ink-900 ring-1 ring-parchment-400/80 dark:bg-ink-800 dark:text-parchment-50 dark:ring-ink-600">
            /api/suggest
          </code>{' '}
          with your model of choice.
        </p>
      </header>

      <Card>
        <div className="grid gap-5 lg:grid-cols-2">
          <Input label="Mood or cuisine" value={mood} onChange={(e) => setMood(e.target.value)} placeholder="Cozy rainy night, Seoul summer…" />
          <Textarea
            label="What’s in the fridge?"
            rows={3}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Half bunch scallions, silken tofu, aging kimchi…"
          />
        </div>
        <Button type="button" className="mt-5" onClick={generate} disabled={loading}>
          {loading ? 'Brewing ideas…' : 'Generate suggestions'}
        </Button>
        {error && (
          <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </Card>

      {loading && <Spinner label="Whisking concepts…" />}

      {!loading && ideas.length > 0 && (
        <section className="grid gap-4 md:grid-cols-3">
          {ideas.map((idea) => (
            <Card key={idea} className="!bg-gradient-to-br !from-parchment-50 !to-parchment-200/95 dark:!from-ink-900 dark:!to-ink-950">
              <p className="text-sm font-medium leading-relaxed text-ink-900 dark:text-parchment-50">{idea}</p>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
