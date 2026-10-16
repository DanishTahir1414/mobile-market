import Link from 'next/link';
import { ArrowUpRight, Smartphone } from 'lucide-react';
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="brand">
            <Smartphone size={23} />
            mobilemarket.
          </Link>
          <p>
            A local connection.
            <br />
            Your next phone, made simple.
          </p>
          <span className="footer-note">Frontend preview · fictional inventory</span>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/mobiles">Browse phones</Link>
          <Link href="/sell">Sell your phone</Link>
          <Link href="/how-inspection-works">Shop inspection</Link>
          <Link href="/shop">
            Our shop <ArrowUpRight size={12} />
          </Link>
        </div>
        <div>
          <h3>Here to help</h3>
          <Link href="/help">Help & selling guide</Link>
          <Link href="/contact">Contact us</Link>
          <Link href="/inspection-policy">Inspection policy</Link>
          <Link href="/employee/login">Staff portal</Link>
        </div>
        <div>
          <h3>A little peace of mind</h3>
          <p>
            Meet the seller. Check the device.
            <br />
            Make a confident decision.
          </p>
          <p>
            Inspection is an observation,
            <br />
            never a warranty.
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Mobile Market</span>
        <div>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/admin/login">Admin</Link>
        </div>
        <span>Made for real connections.</span>
      </div>
    </footer>
  );
}
