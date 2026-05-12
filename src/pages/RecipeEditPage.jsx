import { useNavigate, useParams } from 'react-router-dom';

import RecipeForm from '@/components/recipes/RecipeForm';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { useRecipes } from '@/context/RecipeContext';

export default function RecipeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, getRecipeById, updateRecipe } = useRecipes();
  const recipe = id ? getRecipeById(id) : null;

  if (loading) return <Spinner label="Loading recipe…" />;

  if (!recipe) {
    return (
      <Card className="text-center">
        <p className="text-sm text-ink-800 dark:text-parchment-100">Recipe missing — perhaps it was deleted.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header className="px-1">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.34em] text-primary dark:text-primary-muted">
          Polish
        </span>
        <h1 className="font-display mt-3 text-[1.97rem] tracking-[-0.03em] text-ink-900 dark:text-white">Edit recipe</h1>
        <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-ink-800 dark:text-parchment-100">
          Adjust ingredients, pacing, plating — edits sync straight into your persisted JSON ledger.
        </p>
      </header>

      <RecipeForm
        key={recipe.id}
        mode="edit"
        initial={recipe}
        onCancel={() => navigate(`/recipes/${recipe.id}`)}
        onSubmit={(payload) => updateRecipe(recipe.id, payload).then(() => navigate(`/recipes/${recipe.id}`))}
      />
    </div>
  );
}
