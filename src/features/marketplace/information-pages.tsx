'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowUpRight,
  MapPin,
  ShieldCheck,
  Search,
  MessageCircle,
  CalendarDays,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Notice } from '@/components/ui/empty-state';
import { PageHeading } from '@/components/ui/page-heading';
import { Input, Textarea } from '@/components/ui/field';
import { useDemo } from '@/components/demo-provider';
export function InspectionExplainer() {
  return (
    <div className="container page-space">
      <div className="information-hero">
        <p className="eyebrow">MORE DETAILS. A CLEARER DECISION.</p>
        <h1>
          A proper look.
          <br />A little more confidence.
        </h1>
        <p>
          A phone has a story. A shop inspection helps you understand it, with in-person checks and
          a dated report of what our team observes.
        </p>
        <ButtonLink href="/account/inspections/book">
          Explore booking <ArrowUpRight size={17} />
        </ButtonLink>
      </div>
      <div className="steps-grid">
        {[
          {
            Icon: CalendarDays,
            title: 'Book a visit',
            text: 'Choose an available appointment and bring the advertised phone to the shop.',
          },
          {
            Icon: Search,
            title: 'We look closely',
            text: 'An assigned inspector records identity, functions, defects and limitations.',
          },
          {
            Icon: ShieldCheck,
            title: 'You see the findings',
            text: 'The seller acknowledges the exact findings, then a distinct authorized reviewer approves.',
          },
        ].map((s) => (
          <div className="step-card" key={s.title}>
            <s.Icon size={28} />
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
      <section className="panel inspection-explanation">
        <h2>What gets checked?</h2>
        <div className="two-column">
          {[
            'Device match, body, display and touch',
            'Battery and charging observations',
            'Cameras, audio, buttons, ports and sensors',
            'Mobile network, Wi-Fi and Bluetooth',
            'Applicable biometrics and account locks',
            'Repair indicators and known defects',
            'PTA observation, method and time',
            'Anything we could not test',
          ].map((t) => (
            <p className="check-line" key={t}>
              <Check size={17} />
              {t}
            </p>
          ))}
        </div>
      </section>
      <Notice>
        Inspection is optional. Uninspected listings can still be published. A report describes
        observations at a particular time and is not a warranty, ownership certificate or guarantee.
      </Notice>
      <div className="panel">
        <h2>A badge that has to stay current.</h2>
        <p>
          A real “Shop inspected” badge requires a published, unrevoked, unexpired report that
          matches the phone’s current device revision. Material listing edits remove eligibility. A
          price-only edit does not automatically invalidate it.
        </p>
        <Link href="/inspection-policy" className="text-link">
          Read the draft inspection policy <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
export function ShopPage() {
  return (
    <div className="container page-space">
      <PageHeading
        eyebrow="ONLINE, WITH A REAL SHOP BEHIND IT"
        title="A local place. A real conversation."
        description="The marketplace is designed around one existing mobile shop."
      />
      <div className="shop-grid">
        <div className="shop-map">
          <MapPin size={54} strokeWidth={1} />
          <strong>Shop location coming soon</strong>
          <p>A verified address will appear here.</p>
          <span>Map is intentionally unavailable until configured.</span>
        </div>
        <div className="panel">
          <p className="eyebrow">MOBILE MARKET</p>
          <h2>Come say hello.</h2>
          <dl className="shop-details">
            <div>
              <dt>Address</dt>
              <dd>Owner to configure</dd>
            </div>
            <div>
              <dt>Opening hours</dt>
              <dd>Owner to configure</dd>
            </div>
            <div>
              <dt>Phone / WhatsApp</dt>
              <dd>Owner to configure</dd>
            </div>
            <div>
              <dt>Appointment timezone</dt>
              <dd>Asia/Karachi</dd>
            </div>
          </dl>
          <p>
            Check the confirmed shop details before planning a visit. This frontend does not display
            an invented address or contact number.
          </p>
          <ButtonLink href="/contact" variant="secondary">
            Contact information <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
export function ContactPage() {
  const { notify } = useDemo();
  return (
    <div className="container page-space narrow-page">
      <PageHeading
        eyebrow="HERE TO HELP"
        title="Let’s talk."
        description="Questions about selling, inspections or the marketplace?"
      />
      <Notice>
        Shop support details are awaiting owner configuration. This form is a preview and sends no
        message.
      </Notice>
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          notify('Message validated locally. Nothing was sent.');
        }}
      >
        <div className="form-grid">
          <Input label="Your name" autoComplete="name" required />
          <Input label="Email address" type="email" autoComplete="email" required />
        </div>
        <Input label="Subject" required maxLength={150} />
        <Textarea label="How can we help?" required minLength={10} maxLength={3000} />
        <Button>
          Validate message preview <MessageCircle size={17} />
        </Button>
      </form>
    </div>
  );
}
const faqs = [
  {
    q: 'Do I buy the phone through this website?',
    a: 'No. Contact the seller directly, inspect the phone and agree on the transaction independently. The website has no device checkout, escrow or delivery service.',
  },
  {
    q: 'Does every phone have to be inspected?',
    a: 'No. A seller can advertise without inspection. Only a currently eligible shop report gives a listing the Shop inspected badge.',
  },
  {
    q: 'Is shop inspection a warranty?',
    a: 'No. It is a dated record of observations with testing limitations. It cannot guarantee future performance or establish legal ownership.',
  },
  {
    q: 'What should I include in my listing?',
    a: 'Use clear photos, the correct model and storage, an honest condition description, repair history, known defects and accessories. Keep private identifiers out of public photos.',
  },
  {
    q: 'Where should I meet the seller?',
    a: 'Choose a safe public place. Inspect the actual phone and account lock status before paying. Do not send advance payments to strangers.',
  },
  {
    q: 'What happens after I edit my device details?',
    a: 'Material edits change the device revision and invalidate existing inspection eligibility. A price-only edit does not automatically invalidate a report.',
  },
];
export function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="container page-space narrow-page">
      <PageHeading
        eyebrow="A LITTLE GUIDANCE"
        title="Good questions. Clear answers."
        description="A straightforward guide to buying and selling locally."
      />
      <div className="faq-list">
        {faqs.map((f, i) => (
          <div className="faq-item" key={f.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-${i}`}
            >
              <span>{f.q}</span>
              {open === i ? <Minus size={18} /> : <Plus size={18} />}
            </button>
            {open === i && <p id={`faq-${i}`}>{f.a}</p>}
          </div>
        ))}
      </div>
      <div className="mini-feature">
        <MessageCircle size={25} />
        <div>
          <h3>Still need a hand?</h3>
          <p>See how to reach the shop when contact details are configured.</p>
        </div>
        <ButtonLink href="/contact" variant="secondary">
          Contact us
        </ButtonLink>
      </div>
    </div>
  );
}
const policies = {
  terms: {
    title: 'Terms of use',
    sections: [
      [
        'About the marketplace',
        'Mobile Market connects people advertising mobile phones with prospective buyers. Device negotiation, payment and handover happen independently of the website. No checkout, escrow, shipping or warranty product is offered.',
      ],
      [
        'Your listing responsibilities',
        'Provide accurate model details, repair disclosures, known defects and photos. Do not include private identifiers or advertise a device you are not entitled to sell.',
      ],
      [
        'Inspection reports',
        'Inspection is optional and records dated observations. A badge is conditional on report validity and matching device revision. Reports do not guarantee future performance or establish ownership.',
      ],
      [
        'Moderation and disputes',
        'The shop may review listings and abuse concerns according to final owner-approved policies. Complaint handling, jurisdiction and dispute terms require legal and owner review.',
      ],
    ],
  },
  privacy: {
    title: 'Privacy policy',
    sections: [
      [
        'Information and purpose',
        'The planned application processes account details, listings, verification information and appointment records to operate the marketplace. This frontend preview stores only local favorites, non-sensitive listing drafts and demo appointments in your browser.',
      ],
      [
        'Contact details',
        'Real seller contact details must be disclosed only through a current listing action with seller consent. This demo contains no real sellers or phone numbers.',
      ],
      [
        'Private inspection information',
        'Device identifiers and inspection evidence require restricted storage and access in the future backend. Do not enter real identifiers into this preview.',
      ],
      [
        'Retention and your rights',
        'Final retention periods, deletion procedures, legal basis, processors and privacy contact must be reviewed and supplied by the owner before launch. Clear browser site data to remove local demo records.',
      ],
    ],
  },
  'inspection-policy': {
    title: 'Inspection policy',
    sections: [
      [
        'Scope of inspection',
        'An in-shop inspection records device matching, visible condition, applicable functional checks, repair indicators, defects, testing limitations and dated PTA observations. It is not a warranty or legal ownership check.',
      ],
      [
        'Current eligibility',
        'The proposed baseline is 14 days from observation, conditional on a published listing, matching device revision and an unrevoked report. Material device edits remove eligibility. The final policy requires owner review.',
      ],
      [
        'Acknowledgement and approval',
        'The seller must acknowledge the exact findings revision. An authorized approver distinct from the inspector must check the findings, revision and fee state before report publication.',
      ],
      [
        'Fees, cancellations and corrections',
        'Fees, refunds, opening hours and cancellation/no-show terms are not supplied. The owner must configure these before real bookings. Published findings remain immutable; corrections create linked replacement reports.',
      ],
    ],
  },
};
export function PolicyPage({ policy }: { policy: keyof typeof policies }) {
  const c = policies[policy];
  return (
    <div className="container page-space policy-page">
      <PageHeading
        eyebrow="OWNER-REVIEW DRAFT"
        title={c.title}
        description="Draft content for product review. Not a final legal policy."
      />
      <Notice>
        These terms must be reviewed, completed and approved by the shop owner before launch.
        Frontend policy editing is available as a form preview in shop settings.
      </Notice>
      {c.sections.map(([title, text], i) => (
        <section key={title}>
          <span className="eyebrow">0{i + 1}</span>
          <h2>{title}</h2>
          <p>{text}</p>
        </section>
      ))}
      <ButtonLink href="/staff/settings" variant="secondary">
        View policy editing preview
      </ButtonLink>
    </div>
  );
}
