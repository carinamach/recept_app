import { RECIPE_CATEGORIES } from '@/constants/categories';

const CATEGORY_IDS = new Set(RECIPE_CATEGORIES.map((c) => c.id));

/** @typedef {import('@/types/recipe').RecipeInput} RecipeInput */

/**
 * @param {RecipeInput} input
 */
export function validateRecipeInput(input) {
  const errors = [];

  const title = (input.title ?? '').trim();
  if (!title) errors.push('Title is required');
  else if (title.length > 120) errors.push('Title must be 120 characters or less');

  const description = (input.description ?? '').trim();
  if (description.length > 500) errors.push('Description must be 500 characters or less');

  if (!CATEGORY_IDS.has(input.category)) {
    errors.push('Choose a valid category');
  }

  const cookTime = Number(input.cookTimeMinutes);
  if (!Number.isFinite(cookTime) || cookTime < 1 || cookTime > 1440) {
    errors.push('Cooking time must be between 1 and 1440 minutes');
  }

  const servings = Number(input.servings);
  if (!Number.isFinite(servings) || servings < 1 || servings > 99) {
    errors.push('Servings must be between 1 and 99');
  }

  const ingredients = Array.isArray(input.ingredients) ? input.ingredients : [];
  const nonEmptyIngredients = ingredients.filter((i) => (i.amount ?? '').trim() || (i.name ?? '').trim());
  if (nonEmptyIngredients.length < 2) errors.push('Add at least two ingredients');

  const steps = Array.isArray(input.steps) ? input.steps : [];
  const nonEmptySteps = steps.filter((s) => (s.text ?? '').trim());
  if (nonEmptySteps.length < 1) errors.push('Add at least one instruction step');

  if (input.imageDataUrl && input.imageDataUrl.length > 750_000) {
    errors.push('Image is too large for browser storage — try under ~500 KB');
  }

  return errors;
}
