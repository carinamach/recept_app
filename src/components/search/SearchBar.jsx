import Input from '@/components/ui/Input';

export default function SearchBar({ value, onChange, placeholder = 'Search title, ingredients, notes…' }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-[2.125rem] z-[1] text-xs text-ink-700 dark:text-parchment-200">
        ⌕
      </span>
      <Input
        label="Find a recipe"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        name="recipe-search"
        autoComplete="off"
        spellCheck={false}
        className="[&_input]:bg-parchment-50 [&_input]:pl-[2rem]"
      />
    </div>
  );
}
