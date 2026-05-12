/**
 * Canonical recipe shape; persisted to data/recipes.json (when API runs) and mirrored in LocalStorage.
 *
 * @typedef {{
 *   id: string,
 *   title: string,
 *   description: string,
 *   category: import('@/constants/categories').RecipeCategory,
 *   cookTimeMinutes: number,
 *   servings: number,
 *   ingredients: Array<{ amount: string, name: string }>,
 *   steps: Array<{ text: string }>,
 *   imageUrl: string,
 *   imageDataUrl?: string,
 *   favorited: boolean,
 *   ratingAverage: number | null,
 *   ratingCount: number,
 *   comments: Array<{ id: string, author: string, text: string, createdAt: string }>,
 *   createdAt: string,
 *   updatedAt: string,
 * }} Recipe
 */

/**
 * @typedef {Omit<Recipe, 'id'|'createdAt'|'updatedAt'|'favorited'|'ratingAverage'|'ratingCount'|'comments'> & {
 *   favorited?: boolean,
 *   ratingAverage?: number | null,
 *   ratingCount?: number,
 *   comments?: Recipe['comments'],
 * }} RecipeInput
 */

export {};
