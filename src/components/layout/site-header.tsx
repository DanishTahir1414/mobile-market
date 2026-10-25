'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Heart, Menu, Smartphone, X, UserRound, Plus } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
export function SiteHeader({ logo }: { logo?: { src: string; alt: string } | null }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    ['/mobiles', 'Find a phone'],
    ['/how-inspection-works', 'Shop inspection'],
    ['/shop', 'Visit our shop'],
  ];
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="Mobile Market home">
            <span className={logo ? 'brand__logo' : 'brand__icon'}>
              {logo ? (
                <Image src={logo.src} alt={logo.alt} width={44} height={44} priority />
              ) : (
                <Smartphone size={20} />
              )}
            </span>
            <span>
              mobile<span className="brand__light">market</span>
              <span className="brand__dot">.</span>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([href, label]) => (
              <Link href={href} key={href} className={path === href ? 'active' : ''}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link href="/account/favorites" className="icon-link" aria-label="Saved phones">
              <Heart size={20} />
            </Link>
            <Link href="/login" className="login-link">
              Log in
            </Link>
            <ButtonLink href="/sell" className="sell-button">
              <Plus size={17} /> Sell your phone
            </ButtonLink>
            <Button
              variant="ghost"
              className="mobile-menu-button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation">
            {[...links, ['/account', 'My account'], ['/login', 'Log in']].map(([href, label]) => (
              <Link href={href} key={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <nav className="bottom-nav" aria-label="Quick navigation">
        <Link href="/mobiles">
          <Smartphone size={19} />
          Browse
        </Link>
        <Link href="/account/favorites">
          <Heart size={19} />
          Saved
        </Link>
        <Link href="/sell">
          <Plus size={19} />
          Sell
        </Link>
        <Link href="/account">
          <UserRound size={19} />
          Account
        </Link>
      </nav>
    </>
  );
}
