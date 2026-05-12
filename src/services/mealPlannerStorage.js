/** @typedef {import('@/types/recipe').Recipe} Recipe */

const STORAGE_KEY = 'recept-app:planner:v1';

/**
 * Planner shape: keyed by ISO date string (yyyy-mm-dd).
 * Each day can hold recipe ids assigned to slots.
 * @typedef {Record<string, { breakfast?: string, lunch?: string, dinner?: string }>} MealPlan
 */

/**
 * @returns {MealPlan}
 */
export function loadMealPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

/**
 * @param {MealPlan} plan
 */
export function saveMealPlan(plan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

/**
 * @param {Recipe[]} recipesByIdResolved
 */
export function buildShoppingIngredients(recipesByIdResolved) {
  /** @type {Map<string, string>} key: normalized name → combined amounts text */
  const map = new Map();

  recipesByIdResolved.forEach((recipe) => {
    (recipe.ingredients ?? []).forEach((ing) => {
      const name = (ing.name ?? '').trim();
      const amount = (ing.amount ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      const existing = map.get(key);
      const piece = amount ? `${amount} ${name}` : name;
      if (!existing) map.set(key, piece);
      else if (!existing.toLowerCase().includes(name.toLowerCase())) {
        map.set(key, `${existing}; ${piece}`);
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
}
