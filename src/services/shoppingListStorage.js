const STORAGE_KEY = 'recept-app:shop-checks:v1';

/**
 * Stores checked ingredient line keys for the shopping list UI.
 */
export function loadCheckedKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return /** @type {Set<string>} */ (new Set());
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map(String));
  } catch {
    return new Set();
  }
}

/**
 * @param {Set<string> | string[]} keys
 */
export function saveCheckedKeys(keys) {
  const arr = keys instanceof Set ? Array.from(keys) : keys;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
