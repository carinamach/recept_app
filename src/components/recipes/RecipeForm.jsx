import { useMemo, useState } from 'react';

import { RECIPE_CATEGORIES } from '@/constants/categories';
import { validateRecipeInput } from '@/utils/validators';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

/** @typedef {import('@/types/recipe').Recipe} Recipe */
/** @typedef {import('@/types/recipe').RecipeInput} RecipeInput */

function emptyDraft() {
  return {
    title: '',
    description: '',
    category: 'dinner',
    cookTimeMinutes: 30,
    servings: 2,
    imageUrl: '',
    imageDataUrl: '',
    ingredients: [
      { amount: '', name: '' },
      { amount: '', name: '' },
    ],
    steps: [{ text: '' }],
  };
}

/**
 * @param {{
 *   mode: 'create'|'edit',
 *   initial?: Recipe | null,
 *   onSubmit: (payload: RecipeInput) => Promise<void>,
 *   onCancel?: () => void,
 * }} props
 */
export default function RecipeForm({ mode, initial, onSubmit, onCancel }) {
  const seeded = useMemo(() => {
    if (!initial) return emptyDraft();
    return {
      title: initial.title,
      description: initial.description,
      category: initial.category,
      cookTimeMinutes: initial.cookTimeMinutes,
      servings: initial.servings,
      imageUrl: initial.imageUrl ?? '',
      imageDataUrl: initial.imageDataUrl ?? '',
      ingredients:
        initial.ingredients?.length >= 2
          ? initial.ingredients.map((i) => ({ amount: i.amount ?? '', name: i.name ?? '' }))
          : [
              ...(initial.ingredients ?? []).map((i) => ({ amount: i.amount ?? '', name: i.name ?? '' })),
              { amount: '', name: '' },
              { amount: '', name: '' },
            ],
      steps:
        initial.steps?.length >= 1
          ? initial.steps.map((s) => ({ text: s.text ?? '' }))
          : [{ text: '' }],
    };
  }, [initial]);

  const [form, setForm] = useState(seeded);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState([]);
  const [imageError, setImageError] = useState(null);

  const setField = (key, val) =>
    setForm((f) => ({
      ...f,
      [key]: val,
    }));

  /** @type {RecipeInput} */
  const payload = {
    ...form,
    cookTimeMinutes: Number(form.cookTimeMinutes),
    servings: Number(form.servings),
    imageUrl: (form.imageUrl ?? '').trim(),
    imageDataUrl: form.imageDataUrl?.trim?.() ? form.imageDataUrl.trim() : undefined,
    ingredients: form.ingredients.map((i) => ({ amount: i.amount.trim(), name: i.name.trim() })),
    steps: form.steps.map((s) => ({ text: s.text.trim() })),
  };

  async function submit(e) {
    e.preventDefault();
    const v = validateRecipeInput(payload);
    if (imageError) setErrors([...new Set([...v, imageError])]);
    else setErrors(v);
    if ((imageError ? [...v, imageError] : v).length) return;

    setBusy(true);
    try {
      await onSubmit({
        ...payload,
        ingredients: payload.ingredients.filter((i) => i.amount || i.name),
        steps: payload.steps.filter((s) => s.text),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      {errors.length > 0 && (
        <Card className="!border-red-200/85 !bg-red-50/80 dark:!border-red-900 dark:!bg-red-950/50" padded>
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">Almost there:</p>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-red-700 dark:text-red-200/95">
            {errors.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.92fr)]">
          <div className="space-y-5">
            <Input label="Title" name="title" value={form.title} onChange={(e) => setField('title', e.target.value)} />
            <Textarea
              label="Story & flavor notes"
              name="description"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={5}
              placeholder="What makes this special?"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Category"
                name="category"
                value={form.category}
                onChange={(e) => setField('category', /** @type {any} */ (e.target.value))}
              >
                {RECIPE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <Input
                label="Cook time (minutes)"
                name="cookTimeMinutes"
                type="number"
                inputMode="numeric"
                min={1}
                value={String(form.cookTimeMinutes)}
                onChange={(e) => setField('cookTimeMinutes', Number(e.target.value))}
              />
              <Input
                label="Servings"
                name="servings"
                type="number"
                inputMode="numeric"
                min={1}
                value={String(form.servings)}
                onChange={(e) => setField('servings', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Image URL (optional)"
              name="imageUrl"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) => {
                setField('imageUrl', e.target.value);
                if (imageError) setImageError(null);
              }}
              autoComplete="off"
            />

            <div>
              <span className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-800 dark:text-parchment-200">
                Upload image (stored in-browser)
              </span>
              <input
                type="file"
                accept="image/*"
                className="block w-full cursor-pointer rounded-2xl border-2 border-dashed border-ink-400 bg-parchment-100 px-3 py-8 text-center text-xs font-medium text-ink-900 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white dark:border-accent/50 dark:bg-ink-900 dark:text-parchment-100"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setImageError(null);
                  if (!file) return;
                  if (file.size > 620_000) {
                    setImageError('Uploaded image exceeds ~620 KB safety limit.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => typeof reader.result === 'string' && setField('imageDataUrl', reader.result);
                  reader.readAsDataURL(file);
                }}
              />
              {(form.imageDataUrl || '').length > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={form.imageDataUrl}
                    alt=""
                    className="h-20 w-20 rounded-[1rem] object-cover ring-2 ring-primary/30"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setField('imageDataUrl', '');
                      setImageError(null);
                    }}
                  >
                    Remove upload
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.2rem] tracking-[-0.02em] text-ink-900 dark:text-white">Ingredients</h2>
            <p className="mt-1 text-sm text-ink-800 dark:text-parchment-100">Amount on the left, ingredient on the right.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setForm((f) => ({ ...f, ingredients: [...f.ingredients, { amount: '', name: '' }] }))}
          >
            Add line
          </Button>
        </div>

        <div className="mt-5 grid gap-3">
          {form.ingredients.map((ing, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)_auto] sm:items-end">
              <Input
                label={idx === 0 ? 'Amount' : undefined}
                value={ing.amount}
                onChange={(e) =>
                  setForm((f) => {
                    const next = [...f.ingredients];
                    next[idx] = { ...next[idx], amount: e.target.value };
                    return { ...f, ingredients: next };
                  })
                }
                placeholder="e.g., ½ cup"
              />
              <Input
                label={idx === 0 ? 'Ingredient' : undefined}
                value={ing.name}
                onChange={(e) =>
                  setForm((f) => {
                    const next = [...f.ingredients];
                    next[idx] = { ...next[idx], name: e.target.value };
                    return { ...f, ingredients: next };
                  })
                }
                placeholder="e.g., toasted sesame oil"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="sm:mb-1"
                disabled={form.ingredients.length <= 2}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    ingredients: f.ingredients.filter((_, i) => i !== idx),
                  }))
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.2rem] tracking-[-0.02em] text-ink-900 dark:text-white">Instructions</h2>
            <p className="mt-1 text-sm text-ink-800 dark:text-parchment-100">One quiet step at a time.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setForm((f) => ({ ...f, steps: [...f.steps, { text: '' }] }))}
          >
            Add step
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {form.steps.map((step, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-accent-subtle text-xs font-bold text-accent-dark dark:bg-accent-dark/40 dark:text-accent-subtle">
                {idx + 1}
              </div>
              <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <Textarea
                  label={idx === 0 ? 'Step' : undefined}
                  rows={3}
                  value={step.text}
                  onChange={(e) =>
                    setForm((f) => {
                      const next = [...f.steps];
                      next[idx] = { text: e.target.value };
                      return { ...f, steps: next };
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="sm:mb-1"
                  disabled={form.steps.length <= 1}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      steps: f.steps.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-ink-800 dark:text-parchment-200">
          {mode === 'create' ? 'Everything saves to your browser’s JSON cache.' : 'Edits overwrite the stored copy.'}
        </p>
        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="secondary" disabled={busy} onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={busy} size="lg" className="min-w-[8.5rem]">
            {busy ? 'Saving…' : mode === 'create' ? 'Publish recipe' : 'Save changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}
