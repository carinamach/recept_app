/** @typedef {'breakfast'|'lunch'|'dinner'|'dessert'|'drinks'} RecipeCategory */

export const RECIPE_CATEGORIES = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'drinks', label: 'Drinks' },
];

export const CATEGORY_LABELS = RECIPE_CATEGORIES.reduce((acc, c) => {
  acc[c.id] = c.label;
  return acc;
}, {});
