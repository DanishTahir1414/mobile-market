import type { Metadata } from 'next';
import { DemoProvider } from '@/components/demo-provider';
import { SiteHeader } from '@/components/layout/site-header';
import { Preloader } from '@/components/layout/preloader';
import { resolveSiteMedia } from '@/lib/site-media';
import { SiteFooter } from '@/components/layout/site-footer';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'Mobile Market | Your next phone, a little closer.',
    template: '%s | Mobile Market',
  },
  description:
    'Browse phones, connect with local sellers and explore optional in-shop device inspection. Frontend demonstration.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const logo = resolveSiteMedia('brand-logo');
  return (
    <html lang="en">
      <body>
        <DemoProvider>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          {logo && <Preloader logo={logo} />}
          <SiteHeader logo={logo} />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </DemoProvider>
      </body>
    </html>
  );
}
