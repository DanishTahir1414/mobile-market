export default function Loading() {
  return (
    <div className="container page-space" role="status" aria-label="Loading page">
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-copy" />
      <div className="listing-grid">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton skeleton-card" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
