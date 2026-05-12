import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

import {
  persistRecipes,
  loadRecipesFromStorage,
  importRecipesFromFile,
  reloadFromSeedFile,
  exportRecipesBlob,
} from '@/services/recipeStorage';
import { createId } from '@/utils/ids';

/** @typedef {import('@/types/recipe').Recipe} Recipe */
/** @typedef {import('@/types/recipe').RecipeInput} RecipeInput */

/**
 * @typedef {{
 *   recipes: Recipe[],
 *   loading: boolean,
 *   error: string | null,
 *   saving: boolean,
 * }} RecipeState
 */

/** @type {RecipeState} */
const initialState = {
  recipes: [],
  loading: true,
  error: null,
  saving: false,
};

/**
 * @param {RecipeState} state
 * @param {{
 *   type: 'init:start'|'init:success'|'init:error'|'set:error'|'persist:start'|'persist:done'
 *       | 'recipes:set',
 *   payload?: any
 * }} action
 */
function reducer(state, action) {
  switch (action.type) {
    case 'init:start':
      return { ...state, loading: true, error: null };
    case 'init:success':
      return { ...state, loading: false, recipes: action.payload };
    case 'init:error':
      return { ...state, loading: false, error: action.payload };
    case 'recipes:set':
      return { ...state, recipes: action.payload };
    case 'persist:start':
      return { ...state, saving: true, error: null };
    case 'persist:done':
      return { ...state, saving: false };
    case 'set:error':
      return { ...state, error: action.payload, saving: false };
    default:
      return state;
  }
}

const RecipeContext = createContext(null);

export function RecipeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const hydrate = useCallback(async () => {
    dispatch({ type: 'init:start' });
    try {
      const list = await loadRecipesFromStorage();
      dispatch({ type: 'init:success', payload: list });
    } catch (e) {
      dispatch({ type: 'init:error', payload: e instanceof Error ? e.message : 'Failed to load recipes' });
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const persist = useCallback(async (nextRecipes) => {
    dispatch({ type: 'persist:start' });
    try {
      await persistRecipes(nextRecipes);
      dispatch({ type: 'recipes:set', payload: nextRecipes });
      dispatch({ type: 'persist:done' });
    } catch (e) {
      dispatch({
        type: 'set:error',
        payload: e instanceof Error ? e.message : 'Failed to save recipes',
      });
    }
  }, []);

  const replaceAll = useCallback(
    async (next) => {
      await persist(next);
    },
    [persist],
  );

  const createRecipe = useCallback(
    /** @param {RecipeInput} input */
    async (input) => {
      const now = new Date().toISOString();
      /** @type {Recipe} */
      const recipe = {
        ...input,
        id: createId('rec'),
        favorited: Boolean(input.favorited),
        ratingAverage: input.ratingAverage ?? null,
        ratingCount: input.ratingCount ?? 0,
        comments: input.comments ?? [],
        createdAt: now,
        updatedAt: now,
      };
      const next = [recipe, ...state.recipes];
      await persist(next);
      return recipe;
    },
    [persist, state.recipes],
  );

  const updateRecipe = useCallback(
    /** @param {string} id @param {Partial<RecipeInput & Pick<Recipe, 'id'>>} patch */
    async (id, patch) => {
      const now = new Date().toISOString();
      const next = state.recipes.map((r) =>
        r.id === id
          ? {
              ...r,
              ...patch,
              id: r.id,
              createdAt: r.createdAt,
              updatedAt: now,
              ratingCount: patch.ratingCount ?? r.ratingCount,
              ratingAverage: patch.ratingAverage ?? r.ratingAverage,
              comments: patch.comments ?? r.comments,
            }
          : r,
      );
      await persist(next);
    },
    [persist, state.recipes],
  );

  const deleteRecipe = useCallback(
    async (id) => {
      const next = state.recipes.filter((r) => r.id !== id);
      await persist(next);
    },
    [persist, state.recipes],
  );

  const toggleFavorite = useCallback(
    async (id) => {
      const next = state.recipes.map((r) => (r.id === id ? { ...r, favorited: !r.favorited } : r));
      await persist(next);
    },
    [persist, state.recipes],
  );

  const addComment = useCallback(
    async (id, author, text) => {
      const trimmedAuthor = author.trim() || 'Guest';
      const trimmedText = text.trim();
      if (!trimmedText) return;
      const comment = {
        id: createId('cmt'),
        author: trimmedAuthor,
        text: trimmedText,
        createdAt: new Date().toISOString(),
      };
      const next = state.recipes.map((r) =>
        r.id === id ? { ...r, comments: [...(r.comments ?? []), comment], updatedAt: comment.createdAt } : r,
      );
      await persist(next);
    },
    [persist, state.recipes],
  );

  const addRating = useCallback(
    async (id, stars) => {
      const bounded = Math.min(5, Math.max(1, Math.round(Number(stars))));
      const next = state.recipes.map((r) => {
        if (r.id !== id) return r;
        const oldCount = r.ratingCount ?? 0;
        const oldAvg =
          oldCount > 0 && typeof r.ratingAverage === 'number' && Number.isFinite(r.ratingAverage)
            ? r.ratingAverage
            : 0;
        const count = oldCount + 1;
        const average =
          oldCount === 0 ? bounded : Number(((oldAvg * oldCount + bounded) / count).toFixed(2));

        return {
          ...r,
          ratingCount: count,
          ratingAverage: average,
          updatedAt: new Date().toISOString(),
        };
      });
      await persist(next);
    },
    [persist, state.recipes],
  );

  const importFromDisk = useCallback(async (file) => {
    dispatch({ type: 'persist:start' });
    try {
      const list = await importRecipesFromFile(file);
      dispatch({ type: 'recipes:set', payload: list });
      dispatch({ type: 'persist:done' });
    } catch (e) {
      dispatch({
        type: 'set:error',
        payload: e instanceof Error ? e.message : 'Import failed',
      });
    }
  }, []);

  const resetToSeed = useCallback(async () => {
    dispatch({ type: 'persist:start' });
    try {
      const list = await reloadFromSeedFile();
      dispatch({ type: 'recipes:set', payload: list });
      dispatch({ type: 'persist:done' });
    } catch (e) {
      dispatch({
        type: 'set:error',
        payload: e instanceof Error ? e.message : 'Reload failed',
      });
    }
  }, []);

  const downloadJson = useCallback(() => {
    const blob = exportRecipesBlob(state.recipes);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.recipes]);

  const getRecipeById = useCallback(
    /** @param {string} id */
    (id) => state.recipes.find((r) => r.id === id) ?? null,
    [state.recipes],
  );

  const value = useMemo(
    () => ({
      ...state,
      hydrate,
      createRecipe,
      updateRecipe,
      deleteRecipe,
      toggleFavorite,
      addComment,
      addRating,
      importFromDisk,
      resetToSeed,
      downloadJson,
      replaceAll,
      getRecipeById,
    }),
    [
      state,
      hydrate,
      createRecipe,
      updateRecipe,
      deleteRecipe,
      toggleFavorite,
      addComment,
      addRating,
      importFromDisk,
      resetToSeed,
      downloadJson,
      replaceAll,
      getRecipeById,
    ],
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export function useRecipes() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipes must be used within RecipeProvider');
  return ctx;
}
