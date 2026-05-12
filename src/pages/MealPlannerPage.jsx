import { useMemo, useState } from 'react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { useRecipes } from '@/context/RecipeContext';
import { loadMealPlan, saveMealPlan } from '@/services/mealPlannerStorage';

/** @typedef {'breakfast'|'lunch'|'dinner'} Slot */

/** @typedef {typeof loadMealPlan extends () => infer R ? R : never} MealPlan */

const SLOTS = /** @type {const} */ (['breakfast', 'lunch', 'dinner']);

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

export default function MealPlannerPage() {
  const { recipes, loading } = useRecipes();
  /** @type {[MealPlan, React.Dispatch<React.SetStateAction<MealPlan>>]} */
  const [plan, setPlan] = useState(() => loadMealPlan());
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday());

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  if (loading) return <Spinner label="Loading planner…" />;

  function updateSlot(dateKey, slot, recipeId) {
    setPlan((prev) => {
      const day = { ...(prev[dateKey] ?? {}) };
      if (!recipeId) delete day[slot];
      else day[slot] = recipeId;
      const next = { ...prev, [dateKey]: day };
      saveMealPlan(next);
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.34em] text-primary dark:text-primary-muted">
            Weekly cadence
          </span>
          <h1 className="font-display mt-3 text-[1.97rem] tracking-[-0.03em] text-ink-900 dark:text-white">Meal planner</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-800 dark:text-parchment-100">
            Assign breakfasts, lunches, or dinners across the week — stored privately in your browser and reused for your
            grocery pass.
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

      <div className="grid gap-4 md:grid-cols-7">
        {days.map((d) => {
          const key = isoDate(d);
          const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
          return (
            <Card key={key} className="!p-4 sm:!p-5">
              <div className="mb-4 border-b border-ink-200/65 pb-3 dark:border-ink-700">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-ink-800 dark:text-parchment-200">{weekday}</p>
                <p className="font-display mt-2 text-xl text-ink-900 dark:text-white">{key}</p>
              </div>
              <div className="space-y-4">
                {SLOTS.map((slot) => {
                  /** @type {Slot} */
                  const s = slot;
                  const value = plan[key]?.[s] ?? '';
                  return (
                    <div key={s}>
                      <Select
                        label={s.charAt(0).toUpperCase() + s.slice(1)}
                        value={value}
                        onChange={(e) => updateSlot(key, s, e.target.value)}
                      >
                        <option value="">Free evening</option>
                        {recipes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title}
                          </option>
                        ))}
                      </Select>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <h2 className="font-display text-[1.1rem] text-ink-900 dark:text-white">Heads-up</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-800 dark:text-parchment-100">
          Meal plans map into the shopping view for the visible week span. Clear a dropdown to leave a meal open-ended.
        </p>
      </Card>
    </div>
  );
}
