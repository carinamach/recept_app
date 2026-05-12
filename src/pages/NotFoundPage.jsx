import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function NotFoundPage() {
  return (
    <Card className="py-16 text-center">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.34em] text-primary dark:text-primary-muted">404</p>
      <h1 className="font-display mt-3 text-3xl tracking-[-0.03em] text-ink-900 dark:text-white">This path is still proofing</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink-800 dark:text-parchment-100">
        The page you wanted isn’t in the pantry yet.
      </p>
      <Link to="/" className="mt-6 inline-flex">
        <Button type="button" variant="primary" size="lg">
          Return home
        </Button>
      </Link>
    </Card>
  );
}
