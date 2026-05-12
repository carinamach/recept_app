/** @typedef {import('@/types/recipe').Recipe} Recipe */

const TEMPLATES = [
  'Elevate leftovers into a koji-forward rice skillet with pickles and sesame.',
  'Build a tofu hot pot layered with shiitake, napa cabbage, and glass noodles.',
  'Turn pantry staples into a citrusy grain bowl — think yuzu kosho yogurt.',
  'Sheet-pan gingery chicken thighs with blistered scallions & miso mayo.',
];

/**
 * Lightweight “AI-like” UX without network calls — swap for `/api/suggest`.
 * @param {{ mood?: string, ingredients?: string, recipes?: Recipe[] }} opts
 */
export async function fetchRecipeSuggestions(opts = {}) {
  await new Promise((r) => setTimeout(r, 420));

  const seed = `${opts.mood ?? ''}|${opts.ingredients ?? ''}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash + seed.charCodeAt(i) * (i + 1)) % 997;

  const titlesFromLibrary =
    opts.recipes?.slice(0, 3).map((r) => `Remix "${r.title}" with a new glaze or pickle`) ?? [];

  const picks = [
    ...titlesFromLibrary,
    TEMPLATES[hash % TEMPLATES.length],
    TEMPLATES[(hash + 2) % TEMPLATES.length],
  ];

  return Array.from(new Set(picks)).slice(0, 3);
}
