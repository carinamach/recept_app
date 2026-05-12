import { RECIPE_CATEGORIES } from '@/constants/categories';
import Badge from '@/components/ui/Badge';

/** @typedef {import('@/constants/categories').RecipeCategory|null} Cat */

/** @param {{ selected: Cat, onChange: (c: Cat) => void }} props */
export default function CategoryFilters({ selected, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip active={selected === null} onClick={() => onChange(null)}>
        All flavors
      </FilterChip>
      {RECIPE_CATEGORIES.map((c) => (
        <FilterChip key={c.id} active={selected === c.id} onClick={() => onChange(/** @type {Cat} */ (c.id))}>
          {c.label}
        </FilterChip>
      ))}
    </div>
  );
}

function FilterChip({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full border border-transparent px-1 py-[1px] transition-transform hover:scale-[1.02]`}
      aria-pressed={active}
    >
      <Badge tone={active ? 'accent' : 'muted'} className={`!rounded-full ${active ? '!px-3.5 !py-[0.375rem]' : ''}`}>
        {children}
      </Badge>
    </button>
  );
}
