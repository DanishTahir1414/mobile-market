import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BadgeCheck, ArrowUpRight } from 'lucide-react';
import { demoListings, inspectionChecks } from '@/lib/demo-data';
import { PageHeading } from '@/components/ui/page-heading';
import { InspectionBadge } from '@/components/listings/inspection-badge';
export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const listing = demoListings.find((l) => `demo-${l.id}` === code);
  if (!listing) notFound();
  return (
    <div className="container page-space narrow-page">
      <PageHeading
        eyebrow="SAMPLE SHOP FINDINGS"
        title={`${listing.model} inspection report`}
        description="Findings recorded by the shop team."
      />
      <div className="report-header">
        <BadgeCheck size={40} />
        <div>
          <h2>Report {code}</h2>
          <InspectionBadge state="unavailable" />
        </div>
      </div>
      <div className="panel">
        <dl className="spec-grid">
          <div>
            <dt>Observation date</dt>
            <dd>only</dd>
          </div>
          <div>
            <dt>Validity</dt>
            <dd>No real validity period</dd>
          </div>
          <div>
            <dt>Device revision</dt>
            <dd>Revision 1</dd>
          </div>
          <div>
            <dt>Identifiers</dt>
            <dd>Not displayed publicly</dd>
          </div>
        </dl>
        <h2>Shop observations</h2>
        <p>These observations are separate from seller declarations.</p>
        {inspectionChecks.map(([name, result, note]) => (
          <div className="report-check" key={name}>
            <div>
              <h3>{name}</h3>
              <p>{note}</p>
            </div>
            <span className="status-label">{result.replace('_', ' ')}</span>
          </div>
        ))}
        <h3>Testing limitations</h3>
        <p>
          The device was not opened. Water resistance, future reliability and ownership are not
          established.
        </p>
      </div>
      <div className="panel">
        <h2>Seller-declared information</h2>
        <p>{listing.repairs}</p>
        <p>{listing.defects}</p>
        <Link href={`/mobiles/${listing.id}`} className="text-link">
          Return to listing <ArrowUpRight size={16} />
        </Link>
      </div>
      <p className="tiny-text">
        A production report would preserve immutable findings and linked correction history. No real
        report lineage exists in this preview.
      </p>
    </div>
  );
}
