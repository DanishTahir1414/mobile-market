import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { ListingGrid } from '@/components/listings/listing-grid';
import { demoListings } from '@/lib/demo-data';
export default function HomePage() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-dot" /> YOUR LOCAL PHONE MARKETPLACE
          </div>
          <h1>
            Your next phone.
            <br />A little closer.
          </h1>
          <p>
            Great phones. Real people. One trusted local shop.
            <br className="desktop-only" /> Buy and sell with a little more confidence.
          </p>
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
          <div className="hero-trust">
            <span>
              <Check size={15} /> Connect directly
            </span>
            <span>
              <Check size={15} /> Optional shop inspection
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-art__label">
            <span className="tiny-dot" /> FIND YOUR NEXT UPGRADE
          </div>
          <Image
            src="/images/iphone-titanium.jpg"
            alt="Illustrative phone with a titanium finish"
            fill
            priority
            sizes="(max-width: 800px) 90vw, 45vw"
            className="hero-phone"
          />
          <div className="hero-inspection">
            <span className="hero-inspection__icon">
              <BadgeCheck size={25} />
            </span>
            <div>
              <strong>A closer look. More confidence.</strong>
              <p>In-person checks by our shop team.</p>
            </div>
            <ArrowUpRight size={19} />
          </div>
          <span className="hero-art__caption">Good phones deserve a second story.</span>
        </div>
      </section>
      <div className="benefits-strip">
        <div className="container benefits-inner">
          <span>
            <Smartphone size={19} /> Phones for every kind of upgrade
          </span>
          <span>
            <ShieldCheck size={19} /> Shop inspection, when you want it
          </span>
          <span>
            <MessageCircle size={19} /> Talk to the seller directly
          </span>
        </div>
      </div>
      <section className="container section brands-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR FAVORITE</p>
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
            <p className="eyebrow">FRESH ON THE MARKET</p>
            <h2>Find your next everyday companion.</h2>
          </div>
          <Link href="/mobiles" className="text-link">
            Explore all phones <ArrowRight size={17} />
          </Link>
        </div>
        <p className="demo-caption">
          Sample inventory and illustrative photos. These devices are not offered for sale.
        </p>
        <ListingGrid listings={demoListings.slice(0, 3)} />
      </section>
      <section className="container inspection-feature">
        <div className="inspection-feature__intro">
          <div className="eyebrow">
            <BadgeCheck size={16} /> A LITTLE EXTRA PEACE OF MIND
          </div>
          <h2>
            Not just a badge.
            <br />A proper look.
          </h2>
          <p>
            Our team checks the phone in person, records what they find and shares a dated report.
            You decide with the details in front of you.
          </p>
          <ButtonLink href="/how-inspection-works">
            How shop inspection works <ArrowUpRight size={17} />
          </ButtonLink>
          <small>An inspection is a condition report, not a warranty.</small>
        </div>
        <div className="inspection-preview">
          <div className="inspection-preview__heading">
            <span className="inspection-seal">
              <ShieldCheck size={29} />
            </span>
            <div>
              <h3>The details that matter.</h3>
              <p>Checked by people. Written down clearly.</p>
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
          <div className="inspection-preview__footer">
            Clear findings. No guesswork.
            <ArrowRight size={18} />
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SIMPLE FROM THE START</p>
            <h2>A good phone. A straightforward process.</h2>
          </div>
        </div>
        <div className="steps-grid">
          {[
            {
              n: '01',
              title: 'Find your fit',
              text: 'Browse by model, budget and location. Save the ones that feel right.',
              Icon: Search,
            },
            {
              n: '02',
              title: 'Look a little closer',
              text: 'Read seller details and any available shop inspection findings.',
              Icon: ShieldCheck,
            },
            {
              n: '03',
              title: 'Make a connection',
              text: 'Call or WhatsApp the seller. Meet, check and agree directly.',
              Icon: MessageCircle,
            },
          ].map((s) => (
            <div className="step-card" key={s.n}>
              <div>
                <span>{s.n}</span>
                <s.Icon size={25} strokeWidth={1.4} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container sell-banner">
        <div>
          <p className="eyebrow">MAKE ROOM FOR WHAT’S NEXT</p>
          <h2>
            Your old phone.
            <br />
            Someone’s new favorite.
          </h2>
          <p>Create a listing. Tell its story. Find its next owner.</p>
        </div>
        <ButtonLink href="/sell" variant="secondary">
          Sell your phone <ArrowUpRight size={18} />
        </ButtonLink>
      </section>
      <div className="container shop-line">
        <MapPin size={17} />
        <span>Online convenience. A real local shop behind it.</span>
        <Link href="/shop">
          Come say hello <ArrowRight size={15} />
        </Link>
      </div>
    </>
  );
}
