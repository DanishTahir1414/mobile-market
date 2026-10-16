'use client';
import { Button, ButtonLink } from '@/components/ui/button';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container not-found">
      <h1>Something interrupted that.</h1>
      <p>Please try again. Your browser-saved drafts should still be available.</p>
      <div className="row-actions">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>
    </div>
  );
}
