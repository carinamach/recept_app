import { useNavigate } from 'react-router-dom';

import RecipeForm from '@/components/recipes/RecipeForm';
import { useRecipes } from '@/context/RecipeContext';

export default function RecipeCreatePage() {
  const navigate = useNavigate();
  const { createRecipe } = useRecipes();

  return (
    <div className="space-y-6">
      <header className="px-1">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.34em] text-primary dark:text-primary-muted">
          Compose
        </span>
        <h1 className="font-display mt-3 text-[1.97rem] tracking-[-0.03em] text-ink-900 dark:text-white">New recipe</h1>
        <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-ink-800 dark:text-parchment-100">
          Spacious form, restrained chrome — Pinterest calm meets Japanese mise en place clarity.
        </p>
      </header>

      <RecipeForm mode="create" onCancel={() => navigate(-1)} onSubmit={(payload) => createRecipe(payload).then((r) => navigate(`/recipes/${r.id}`))} />
    </div>
  );
}
