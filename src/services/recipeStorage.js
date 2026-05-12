/** @typedef {import('@/types/recipe').Recipe} Recipe */

const STORAGE_KEY = 'recept-app:recipes:v1';
const SEED_PATH = '/recipes.json';
const API_RECIPES = '/api/recipes';

/**
 * Normalize persisted recipe arrays for older copies.
 * @param {unknown} recipe
 * @returns {Recipe}
 */
function normalizeRecipe(recipe) {
  const r = /** @type {Recipe} */ (recipe);
  return {
    ...r,
    favorited: Boolean(r.favorited),
    ratingAverage:
      typeof r.ratingAverage === 'number' && Number.isFinite(r.ratingAverage)
        ? r.ratingAverage
        : null,
    ratingCount: typeof r.ratingCount === 'number' ? r.ratingCount : 0,
    comments: Array.isArray(r.comments) ? r.comments : [],
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    steps: Array.isArray(r.steps) ? r.steps : [],
    imageUrl: typeof r.imageUrl === 'string' ? r.imageUrl : '',
  };
}

async function fetchSeedRecipes() {
  const res = await fetch(SEED_PATH);
  if (!res.ok) {
    throw new Error(`Unable to load seed recipes (${res.status}).`);
  }
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.recipes;
  if (!Array.isArray(list)) {
    throw new Error('Seed file has an unexpected shape.');
  }
  return list.map(normalizeRecipe);
}

/**
 * Try to load from file API (when dev server + Express run together).
 * @returns {Promise<Recipe[]|null>}
 */
async function fetchRecipesFromApi() {
  try {
    const res = await fetch(API_RECIPES);
    if (!res.ok) return null;
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.recipes;
    if (!Array.isArray(list)) return null;
    return list.map(normalizeRecipe);
  } catch {
    return null;
  }
}

function mirrorToLocalStorage(recipes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch {
    /* quota / private mode */
  }
}

/**
 * Hydrate recipes: file API → else LocalStorage → else seed JSON + persist.
 */
export async function loadRecipesFromStorage() {
  const fromApi = await fetchRecipesFromApi();
  if (fromApi) {
    mirrorToLocalStorage(fromApi);
    return fromApi;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : parsed.recipes;
      if (!Array.isArray(list)) throw new Error('Corrupt payload');
      return list.map(normalizeRecipe);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  const seeded = await fetchSeedRecipes();
  await persistRecipes(seeded);
  return seeded;
}

/**
 * Persist full list: PUT to file API when available, always mirror LocalStorage.
 * @param {Recipe[]} recipes
 */
export async function persistRecipes(recipes) {
  try {
    const res = await fetch(API_RECIPES, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: 1, recipes }),
    });
    if (res.ok) {
      mirrorToLocalStorage(recipes);
      return recipes;
    }
  } catch {
    /* API offline */
  }

  mirrorToLocalStorage(recipes);
  return recipes;
}

/**
 * Reset to bundled JSON (useful for demos).
 */
export async function reloadFromSeedFile() {
  const seeded = await fetchSeedRecipes();
  await persistRecipes(seeded);
  return seeded;
}

/**
 * Serialize to downloadable JSON blob.
 */
export function exportRecipesBlob(recipes) {
  const body = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), recipes }, null, 2);
  return new Blob([body], { type: 'application/json;charset=utf-8' });
}

/**
 * Import from user-selected JSON file; validates minimal shape.
 * @param {File} file
 */
export async function importRecipesFromFile(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.recipes;
  if (!Array.isArray(list)) {
    throw new Error('JSON must contain a `recipes` array.');
  }
  const recipes = list.map(normalizeRecipe);
  await persistRecipes(recipes);
  return recipes;
}
