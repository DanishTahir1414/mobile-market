import { AppointmentDetail, AbuseDetail, StaffDetail } from '@/features/staff/detail-workflows';
import { notFound } from 'next/navigation';
import { WorkspaceShell } from '@/components/layout/workspace-shell';
import { AuthForm, type AuthMode } from '@/features/auth/auth-form';
import {
  StaffOverview,
  Moderation,
  ModerationDetail,
  AppointmentCalendar,
  InspectionBench,
  ReportReview,
  Fees,
  Team,
  Catalog,
  ShopSettings,
  AbuseQueue,
  AuditHistory,
} from '@/features/staff/staff-pages';
const authModes: Record<string, AuthMode> = {
  activate: 'activate',
  'mfa/setup': 'mfa-setup',
  'mfa/challenge': 'mfa',
  'mfa/recovery': 'recovery',
};
const pages = {
  overview: StaffOverview,
  moderation: Moderation,
  appointments: AppointmentCalendar,
  inspections: InspectionBench,
  reports: ReportReview,
  fees: Fees,
  team: Team,
  catalog: Catalog,
  settings: ShopSettings,
  abuse: AbuseQueue,
  audit: AuditHistory,
};
export default async function Page({ params }: { params: Promise<{ section?: string[] }> }) {
  const segments = (await params).section || [];
  const key = segments.join('/') || 'overview';
  if (authModes[key]) return <AuthForm mode={authModes[key]} />;
  let content;
  if (segments.length === 2 && segments[0] === 'appointments')
    content = <AppointmentDetail id={segments[1]} />;
  else if (key === 'abuse/demo') content = <AbuseDetail />;
  else if (key === 'team/demo') content = <StaffDetail />;
  else if (segments.length === 2 && segments[0] === 'moderation' && segments[1])
    content = <ModerationDetail id={segments[1]} />;
  else if (key === 'inspections/demo') content = <InspectionBench />;
  else {
    const Component = pages[key as keyof typeof pages];
    if (!Component) notFound();
    content = <Component />;
  }
  return <WorkspaceShell staff>{content}</WorkspaceShell>;
}
