'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  ArrowUpRight,
  LayoutDashboard,
  Smartphone,
  CalendarDays,
  Heart,
  Bell,
  UserRound,
  LockKeyhole,
  ShieldCheck,
  ListChecks,
  UsersRound,
  Settings,
  Flag,
  ClipboardList,
  BookOpen,
  ScrollText,
} from 'lucide-react';
const accountLinks = [
  { href: '/account', label: 'Overview', Icon: LayoutDashboard },
  { href: '/account/listings', label: 'My listings', Icon: Smartphone },
  { href: '/account/inspections', label: 'My inspections', Icon: CalendarDays },
  { href: '/account/favorites', label: 'Saved phones', Icon: Heart },
  { href: '/account/notifications', label: 'Notifications', Icon: Bell },
  { href: '/account/profile', label: 'Profile', Icon: UserRound },
  { href: '/account/security', label: 'Security', Icon: LockKeyhole },
  { href: '/account/sessions', label: 'Active sessions', Icon: ShieldCheck },
];
const staffLinks = [
  { href: '/staff', label: 'Overview', Icon: LayoutDashboard },
  { href: '/staff/moderation', label: 'Listing moderation', Icon: ListChecks },
  { href: '/staff/abuse', label: 'Abuse reports', Icon: Flag },
  { href: '/staff/appointments', label: 'Appointments', Icon: CalendarDays },
  {
    href: '/staff/inspections',
    label: 'Inspection bench',
    Icon: ClipboardList,
  },
  { href: '/staff/reports', label: 'Report approvals', Icon: ShieldCheck },
  { href: '/staff/fees', label: 'Inspection fees', Icon: BookOpen },
  { href: '/staff/team', label: 'Staff & permissions', Icon: UsersRound },
  { href: '/staff/catalog', label: 'Phone catalog', Icon: Smartphone },
  { href: '/staff/settings', label: 'Shop settings', Icon: Settings },
  { href: '/staff/audit', label: 'Audit history', Icon: ScrollText },
];
export function WorkspaceShell({
  children,
  staff = false,
}: {
  children: ReactNode;
  staff?: boolean;
}) {
  const path = usePathname();
  return (
    <div className="container workspace">
      <aside className="workspace-nav">
        <p className="eyebrow">{staff ? 'SHOP WORKSPACE' : 'YOUR SPACE'}</p>
        <h2>{staff ? 'Shop team' : 'My account'}</h2>
        <p className="workspace-demo">Frontend preview</p>
        <nav aria-label={staff ? 'Staff navigation' : 'Account navigation'}>
          {(staff ? staffLinks : accountLinks).map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={
                href === path || (href !== (staff ? '/staff' : '/account') && path.startsWith(href))
                  ? 'active'
                  : ''
              }
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <Link href={staff ? '/employee/login' : '/sell'} className="workspace-bottom">
          {staff ? 'Staff sign in' : 'Create a listing'}
          <ArrowUpRight size={16} />
        </Link>
      </aside>
      <section className="workspace-content">{children}</section>
    </div>
  );
}
