import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import ThemeToggle from '@/components/layout/ThemeToggle';
import Button from '@/components/ui/Button';

const linkBase =
  'rounded-full px-3 py-1.5 text-sm font-semibold tracking-tight transition-colors duration-150';
/** Explicit colors so body text-inheritance (dark:text-parchment-100) does not wash out links on the bar */
const linkInactive =
  'text-ink-800 hover:bg-secondary-muted hover:text-ink-900 dark:text-parchment-300 dark:hover:bg-ink-800 dark:hover:text-parchment-50';
const linkActive =
  'bg-secondary text-ink-900 shadow-sm ring-1 ring-primary/25 dark:bg-primary/90 dark:text-white dark:ring-primary/50 dark:hover:bg-primary-hover';

export default function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: 'Discover' },
    { to: '/recipes/browse', label: 'All recipes' },
    { to: '/recipes/new', label: 'New recipe' },
    { to: '/planner', label: 'Planner' },
    { to: '/shop', label: 'Shopping list' },
    { to: '/suggest', label: 'Ideas' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md">
      <div className="border-b border-parchment-300 bg-parchment-50/95 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 text-ink-900 dark:text-parchment-100 sm:px-6 lg:px-8">
          <NavLink to="/" className="group flex shrink-0 items-center gap-2.5 rounded-full px-1 py-0.5" end>
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-[0.9rem] font-bold text-white shadow-float">
              R
            </span>
            <div className="leading-tight">
              <span className="font-display block text-[1rem] tracking-tight text-ink-900 group-hover:text-primary-hover dark:text-parchment-50 dark:group-hover:text-primary-muted sm:text-[1.1rem]">
                Recept
              </span>
              <span className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-700 dark:text-parchment-400 xs:block">
                Recipe journal
              </span>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-0.5 md:flex [&_a]:no-underline">{renderLinks(false)}</nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="md:hidden !rounded-2xl !px-3 !shadow-none ring-ink-200/75 dark:!ring-ink-600"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((o) => !o)}
            >
              Menu
            </Button>
          </div>
        </div>

        {open && (
          <nav
            id="mobile-nav"
            className="border-t border-parchment-300 bg-parchment-50 px-4 py-4 dark:border-ink-800 dark:bg-ink-950 md:hidden animate-fade-in"
          >
            <div className="mx-auto flex max-w-md flex-col gap-1">{renderLinks(true)}</div>
          </nav>
        )}
      </div>
    </header>
  );

  function renderLinks(closeOnNavigate) {
    return links.map((l) => (
      <NavLink
        key={l.to}
        to={l.to}
        end={l.to === '/' || l.to === '/recipes/browse'}
        className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
        onClick={() => {
          if (closeOnNavigate) setOpen(false);
        }}
      >
        {l.label}
      </NavLink>
    ));
  }
}
