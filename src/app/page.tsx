import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { ListingGrid } from '@/components/listings/listing-grid';
import { HeroStage } from '@/features/home/hero-stage';
import { demoListings } from '@/lib/demo-data';
import { resolveSiteMedia } from '@/lib/site-media';
export default function HomePage() {
  const hero = resolveSiteMedia('home-hero');
  return (
    <>
      <HeroStage
        copy={
          <>
            <h1>
              Your next phone.
              <br />A little closer.
            </h1>
            <p>Great phones. Real people. One local shop.</p>
            <form action="/mobiles" className="hero-search">
              <Search size={20} />
              <input
                name="query"
                aria-label="Search phones"
                placeholder="Try ‘iPhone 15’ or ‘Samsung’"
              />
              <button aria-label="Search phones">
                <ArrowRight size={20} />
              </button>
            </form>
          </>
        }
        fallback={
          hero && (
            <div className="hero-art">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                sizes="(max-width: 800px) 90vw, 45vw"
                className="hero-phone"
              />
            </div>
          )
        }
      />
      <section className="container section brands-section">
        <div className="section-heading">
          <div>
            <h2>Start with a brand.</h2>
          </div>
          <Link href="/mobiles" className="text-link">
            All phones <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="brand-grid">
          {[
            { name: 'Apple', mark: 'a' },
            { name: 'Samsung', mark: 'S' },
            { name: 'Google', mark: 'G' },
            { name: 'OnePlus', mark: '1+' },
            { name: 'Xiaomi', mark: 'mi' },
            { name: 'Oppo', mark: 'oppo' },
          ].map((b) => (
            <Link href={`/mobiles?brand=${b.name}`} className="brand-tile" key={b.name}>
              <span className={`brand-mark brand-mark--${b.name.toLowerCase()}`}>{b.mark}</span>
              <span>{b.name}</span>
              <ArrowUpRight size={14} />
            </Link>
          ))}
        </div>
      </section>
      <section className="container section recent-section">
        <div className="section-heading">
          <div>
            <h2>Find your next everyday companion.</h2>
          </div>
          <Link href="/mobiles" className="text-link">
            Explore all phones <ArrowRight size={17} />
          </Link>
        </div>
        <ListingGrid listings={demoListings.slice(0, 3)} />
      </section>
      <section className="container inspection-feature">
        <div className="inspection-feature__intro">
          <h2>
            Not just a badge.
            <br />A proper look.
          </h2>
          <ButtonLink href="/how-inspection-works">
            How shop inspection works <ArrowUpRight size={17} />
          </ButtonLink>
        </div>
        <div className="inspection-preview">
          <div className="inspection-preview__heading">
            <span className="inspection-seal">
              <ShieldCheck size={29} />
            </span>
            <div>
              <h3>The details that matter.</h3>
            </div>
          </div>
          {[
            'Device identity & physical condition',
            'Display, cameras & everyday functions',
            'Battery, charging & connectivity',
            'PTA observations & disclosed defects',
          ].map((text, i) => (
            <div className="inspection-check" key={text}>
              <span>0{i + 1}</span>
              <p>{text}</p>
              <Check size={17} />
            </div>
          ))}
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <h2>A good phone. A straightforward process.</h2>
          </div>
        </div>
        <div className="steps-grid">
          {[
            {
              n: '01',
              title: 'Find your fit',
              Icon: Search,
            },
            {
              n: '02',
              title: 'Look a little closer',
              Icon: ShieldCheck,
            },
            {
              n: '03',
              title: 'Make a connection',
              Icon: MessageCircle,
            },
          ].map((s) => (
            <div className="step-card" key={s.n}>
              <div>
                <span>{s.n}</span>
                <s.Icon size={25} strokeWidth={1.4} />
              </div>
              <h3>{s.title}</h3>
            </div>
          ))}
        </div>
      </section>
      <section className="container sell-banner">
        <div>
          <h2>
            Your old phone.
            <br />
            Someone’s new favorite.
          </h2>
        </div>
        <ButtonLink href="/sell" variant="secondary">
          Sell your phone <ArrowUpRight size={18} />
        </ButtonLink>
      </section>
      <div className="container shop-line">
        <MapPin size={17} />
        <Link href="/shop">
          Visit our shop <ArrowRight size={15} />
        </Link>
      </div>
    </>
  );
}
