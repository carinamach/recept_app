const STORAGE_KEY = 'recept-app:recent:v1';
const MAX = 24;

/** @typedef {{ id: string, viewedAt: string }} RecentEntry */

/**
 * @returns {RecentEntry[]}
 */
export function loadRecentEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * @param {string} id
 */
export function pushRecentRecipe(id) {
  const prev = loadRecentEntries().filter((x) => x.id !== id);
  const entry = { id, viewedAt: new Date().toISOString() };
  const next = [entry, ...prev].slice(0, MAX);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
