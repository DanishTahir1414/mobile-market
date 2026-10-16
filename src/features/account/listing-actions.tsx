'use client';
import { useState } from 'react';
import { useDemo } from '@/components/demo-provider';
import { Button, ButtonLink } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { lifecycleExplanation, nextListingStatuses } from '@/lib/listing-lifecycle';
import { draftSchema } from '@/lib/validation';
import type { ListingDraft, ListingStatus } from '@/lib/types';

export function ListingActions({ draft }: { draft: ListingDraft }) {
  const { saveDraft, notify } = useDemo();
  const [target, setTarget] = useState<ListingStatus | null>(null);
  const editable = !['sold', 'withdrawn', 'pending_review'].includes(draft.status);
  return (
    <div>
      <p>{lifecycleExplanation[draft.status]}</p>
      <div className="row-actions">
        <ButtonLink href={`/account/listings/${draft.id}/preview`} variant="secondary">
          Preview saved listing
        </ButtonLink>
        {editable && (
          <ButtonLink href={`/account/listings/${draft.id}/edit`} variant="secondary">
            Edit listing
          </ButtonLink>
        )}
        {nextListingStatuses(draft.status).map((status) => (
          <Button key={status} variant="secondary" onClick={() => setTarget(status)}>
            Demo: {status.replaceAll('_', ' ')}
          </Button>
        ))}
      </div>
      <Dialog
        open={target !== null}
        onClose={() => setTarget(null)}
        title="Confirm local demo transition"
      >
        <p>
          This changes only this browser’s scenario to {target?.replaceAll('_', ' ')}. No real sale,
          moderation, publication or renewal occurs. Inspection eligibility is never renewed here.
        </p>
        <Button
          onClick={() => {
            if (!target || !nextListingStatuses(draft.status).includes(target)) return;
            if (target === 'pending_review' && !draftSchema.safeParse(draft).success) {
              notify('Complete listing validation in the editor before local resubmission.');
              setTarget(null);
              return;
            }
            const persisted = saveDraft({
              ...draft,
              status: target,
              updatedAt: new Date().toISOString(),
            });
            notify(
              persisted
                ? 'Local demo state updated. No real listing changed.'
                : 'Storage unavailable. Scenario updated in this tab only.',
            );
            setTarget(null);
          }}
        >
          Confirm demo change
        </Button>
      </Dialog>
    </div>
  );
}
