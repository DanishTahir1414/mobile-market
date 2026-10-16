import { Suspense } from 'react';
import { Browse } from '@/features/marketplace/browse';
export const metadata = { title: 'Browse phones' };
export default function Page() {
  return (
    <Suspense fallback={<div className="container page-space">Loading phones…</div>}>
      <Browse />
    </Suspense>
  );
}
