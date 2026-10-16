import { notFound } from 'next/navigation';
import { AuthForm, type AuthMode } from '@/features/auth/auth-form';
import {
  ContactPage,
  HelpPage,
  InspectionExplainer,
  PolicyPage,
  ShopPage,
} from '@/features/marketplace/information-pages';
const auth: Record<string, AuthMode> = {
  login: 'login',
  signup: 'signup',
  'forgot-password': 'forgot',
  'reset-password': 'reset',
  'verify-email': 'email',
  'verify-phone': 'phone',
};
const info: Record<string, React.ComponentType> = {
  contact: ContactPage,
  help: HelpPage,
  'how-inspection-works': InspectionExplainer,
  shop: ShopPage,
};
export function generateStaticParams() {
  return [...Object.keys(auth), ...Object.keys(info), 'terms', 'privacy', 'inspection-policy'].map(
    (page) => ({ page }),
  );
}
export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  return { title: (await params).page.replaceAll('-', ' ') };
}
export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (auth[page]) return <AuthForm mode={auth[page]} />;
  if (info[page]) {
    const Component = info[page];
    return <Component />;
  }
  if (page === 'terms' || page === 'privacy' || page === 'inspection-policy')
    return <PolicyPage policy={page} />;
  notFound();
}
