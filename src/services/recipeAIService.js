/** @typedef {import('@/types/recipe').Recipe} Recipe */

const TEMPLATES = [
  'Elevate leftovers into a koji-forward rice skillet with pickles and sesame.',
  'Build a tofu hot pot layered with shiitake, napa cabbage, and glass noodles.',
  'Turn pantry staples into a citrusy grain bowl — think yuzu kosho yogurt.',
  'Sheet-pan gingery chicken thighs with blistered scallions & miso mayo.',
];

/**
 * Offline fallback when API saknas eller ingen OpenAI-nyckel.
 * @param {{ mood?: string, ingredients?: string, recipes?: Recipe[] }} opts
 */
async function fetchRecipeSuggestionsMock(opts = {}) {
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

/**
 * Anropar POST /api/suggest (OpenAI via Express) vid npm run dev; annars mock.
 * @param {{ mood?: string, ingredients?: string, recipes?: Recipe[] }} opts
 */
export async function fetchRecipeSuggestions(opts = {}) {
  try {
    const res = await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mood: opts.mood ?? '',
        ingredients: opts.ingredients ?? '',
        recipeTitles: opts.recipes?.map((r) => r.title).filter(Boolean) ?? [],
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
      return data.suggestions.map(String).slice(0, 5);
    }

    if (res.status === 503 && data.error === 'no_api_key') {
      return fetchRecipeSuggestionsMock(opts);
    }

    if (!res.ok) {
      const msg =
        typeof data.message === 'string'
          ? data.message
          : typeof data.error === 'string'
            ? data.error
            : `Fel från servern (${res.status})`;
      throw new Error(msg);
    }
  } catch (e) {
    if (e instanceof TypeError) {
      return fetchRecipeSuggestionsMock(opts);
    }
    throw e;
  }

  return fetchRecipeSuggestionsMock(opts);
}
