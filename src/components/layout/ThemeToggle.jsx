import Button from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={toggleTheme}
      className={`!rounded-2xl !px-3 !shadow-none ring-ink-200/75 dark:!ring-ink-600 ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span aria-hidden>{isDark ? '☀' : '☾'}</span>
    </Button>
  );
}
