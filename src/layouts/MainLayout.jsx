import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Spinner from '@/components/ui/Spinner';

export default function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-parchment-50 via-parchment-100/65 to-parchment-200/70 pb-10 dark:from-ink-950 dark:via-ink-950 dark:to-black">
      <Header />
      <main className="mx-auto mt-8 w-full max-w-6xl flex-1 px-4 animate-fade-in sm:mt-11 sm:px-6 lg:px-8">
        <Suspense fallback={<Spinner label="Opening…" />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="mx-auto mt-14 w-full max-w-6xl px-6 pb-6 text-center text-[0.73rem] font-medium text-ink-800 dark:text-parchment-200">
        Crafted as a pantry for ideas — imagery via Unsplash in seed recipes.
      </footer>
    </div>
  );
}
