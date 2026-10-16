import { ButtonLink } from '@/components/ui/button';
export default function NotFound() {
  return (
    <div className="container not-found">
      <p className="eyebrow">404 · NOT AROUND HERE</p>
      <h1>This page has moved on.</h1>
      <p>Let’s get you back to a phone worth finding.</p>
      <ButtonLink href="/mobiles">Browse phones</ButtonLink>
    </div>
  );
}
