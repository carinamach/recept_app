import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { useRecipes } from '@/context/RecipeContext';
import { buildShoppingIngredients, loadMealPlan } from '@/services/mealPlannerStorage';
import { loadCheckedKeys, saveCheckedKeys } from '@/services/shoppingListStorage';

function startOfWeekMonday(d = new Date()) {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(d, n) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export default function ShoppingListPage() {
  const { recipes, loading } = useRecipes();
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday());
  const plan = loadMealPlan();
  const [checked, setChecked] = useState(() => loadCheckedKeys());

  useEffect(() => {
    saveCheckedKeys(checked);
  }, [checked]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const lineup = useMemo(() => {
    const ids = /** @type {Set<string>} */ (new Set());
    days.forEach((d) => {
      const key = isoDate(d);
      const slots = plan[key];
      if (!slots) return;
      ['breakfast', 'lunch', 'dinner'].forEach((slot) => {
        const rid = slots[slot];
        if (rid) ids.add(rid);
      });
    });
    const list = [...ids];
    return list.map((id) => recipes.find((r) => r.id === id)).filter(Boolean);
  }, [days, plan, recipes]);

  const lines = useMemo(() => buildShoppingIngredients(lineup), [lineup]);

  if (loading) return <Spinner label="Preparing groceries…" />;

  function lineKey(line) {
    return line.trim().toLowerCase();
  }

  function toggleLine(line) {
    const key = lineKey(line);
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function clearMarks() {
    setChecked(new Set());
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.34em] text-primary dark:text-primary-muted">
            Market pass
          </span>
          <h1 className="font-display mt-3 text-[1.97rem] tracking-[-0.03em] text-ink-900 dark:text-white">Shopping list</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-800 dark:text-parchment-100">
            Consolidates ingredients planned for Monday–Sunday of the chosen week. Check items off as you weave the aisles.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setWeekStart((ws) => addDays(ws, -7))}>
            ← Previous week
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setWeekStart(() => startOfWeekMonday())}>
            This week
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setWeekStart((ws) => addDays(ws, 7))}>
            Next week →
          </Button>
        </div>
      </header>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-800 dark:text-parchment-100">
            Pulling from <span className="font-semibold text-ink-800 dark:text-parchment-100">{lineup.length}</span> planned
            recipe{lineup.length === 1 ? '' : 's'} / {lines.length} ingredient line{lines.length === 1 ? '' : 's'}.
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={clearMarks}>
            Clear checks
          </Button>
        </div>

        {lines.length === 0 ? (
          <p className="mt-6 text-sm font-medium text-ink-800 dark:text-parchment-100">
            No meals slotted for this week — visit the planner to stack your bowls.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {lines.map((line) => {
              const key = lineKey(line);
              const done = checked.has(key);
              return (
                <li key={key}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-parchment-400/95 bg-parchment-100 px-3 py-2.5 text-sm transition hover:bg-parchment-200 dark:border-ink-600 dark:bg-ink-950 dark:hover:bg-ink-900">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 rounded border-2 border-ink-600 bg-parchment-50 text-primary focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-parchment-100 dark:border-accent/60 dark:bg-ink-900 dark:focus:ring-offset-ink-950"
                      checked={done}
                      onChange={() => toggleLine(line)}
                    />
                    <span
                      className={
                        done
                          ? 'text-ink-600 line-through decoration-2 decoration-ink-400 dark:text-parchment-400 dark:decoration-parchment-400'
                          : 'font-medium text-ink-900 dark:text-parchment-50'
                      }
                    >
                      {line}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
