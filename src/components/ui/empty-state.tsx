import { SearchX, Info } from 'lucide-react';
import type { ReactNode } from 'react';
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <SearchX size={32} strokeWidth={1.4} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice">
      <Info size={18} />
      <div>{children}</div>
    </div>
  );
}
