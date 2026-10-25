'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Smartphone, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
export type AuthMode =
  | 'login'
  | 'signup'
  | 'forgot'
  | 'reset'
  | 'email'
  | 'phone'
  | 'admin'
  | 'employee'
  | 'activate'
  | 'mfa-setup'
  | 'mfa'
  | 'recovery';
const copy: Record<
  AuthMode,
  { eyebrow: string; title: string; description: string; button: string }
> = {
  login: {
    eyebrow: 'WELCOME BACK',
    title: 'Your next chapter starts here.',
    description: 'Sign in to manage listings, save favorites and plan your next upgrade.',
    button: 'Sign in',
  },
  signup: {
    eyebrow: 'MAKE YOURSELF AT HOME',
    title: 'A good connection starts here.',
    description: 'Create your account and find your place in the local phone market.',
    button: 'Create account',
  },
  forgot: {
    eyebrow: 'LET’S GET YOU BACK IN',
    title: 'Forgot your password?',
    description: 'Enter your email to request a password reset link.',
    button: 'Request reset link',
  },
  reset: {
    eyebrow: 'A FRESH START',
    title: 'Choose a new password.',
    description: 'Use a unique passphrase with at least 15 characters.',
    button: 'Reset password',
  },
  email: {
    eyebrow: 'ONE MORE STEP',
    title: 'Check your inbox.',
    description: 'Confirm your email address using the link in your verification message.',
    button: 'Confirm verification token',
  },
  phone: {
    eyebrow: 'YOUR NUMBER, VERIFIED',
    title: 'Make the connection yours.',
    description: 'Phone ownership must be verified before posting a real listing.',
    button: 'Request verification code',
  },
  admin: {
    eyebrow: 'SHOP ADMINISTRATION',
    title: 'Welcome to the shop workspace.',
    description: 'Invited staff only. Your assigned permissions determine access.',
    button: 'Continue to MFA',
  },
  employee: {
    eyebrow: 'THE TEAM BEHIND THE DETAILS',
    title: 'A closer look starts with you.',
    description: 'Staff sign-in for assigned moderation and inspection work.',
    button: 'Continue to MFA',
  },
  activate: {
    eyebrow: 'YOU’RE INVITED',
    title: 'Join the shop team.',
    description: 'Activate an invitation and set up your password before MFA enrollment.',
    button: 'Activate invitation',
  },
  'mfa-setup': {
    eyebrow: 'A SECOND LAYER',
    title: 'Protect your staff access.',
    description: 'Connect an authenticator after validating your staff invitation.',
    button: 'Confirm authenticator',
  },
  mfa: {
    eyebrow: 'ONE LAST CHECK',
    title: 'Your authenticator code.',
    description: 'Enter the current code from your authenticator app.',
    button: 'Verify code',
  },
  recovery: {
    eyebrow: 'RECOVER SECURELY',
    title: 'Use a recovery code.',
    description: 'Recovery codes are single-use and must be validated by the identity service.',
    button: 'Verify recovery code',
  },
};
export function AuthForm({ mode }: { mode: AuthMode }) {
  const [show, setShow] = useState(false),
    [message, setMessage] = useState('');
  const c = copy[mode],
    staff = ['admin', 'employee', 'activate', 'mfa-setup', 'mfa', 'recovery'].includes(mode),
    credentials = ['login', 'signup', 'admin', 'employee'].includes(mode),
    password = credentials || ['reset', 'activate'].includes(mode);
  return (
    <div className="container auth-layout">
      <section className="auth-aside">
        <div className="eyebrow">
          <span className="tiny-dot" /> {staff ? 'SHOP TEAM' : 'MOBILE MARKET'}
        </div>
        <h2>
          {staff ? (
            <>
              Good work.
              <br />
              Clear details.
              <br />
              Real confidence.
            </>
          ) : (
            <>
              A good phone.
              <br />A real person.
              <br />A better connection.
            </>
          )}
        </h2>
        <p>
          {staff
            ? 'A considered workspace for the people who make the details matter.'
            : 'Buy and sell locally, with the details you need and the freedom to decide.'}
        </p>
        <div className="auth-aside__footer">
          <ShieldCheck size={25} />
          <span>
            {staff
              ? 'Invitation-only accounts. MFA required.'
              : 'Your details stay yours. No account is created in this preview.'}
          </span>
        </div>
      </section>
      <section className="auth-card">
        <div className="auth-icon">
          {staff ? <LockKeyhole size={25} /> : <Smartphone size={25} />}
        </div>
        <p className="eyebrow">{c.eyebrow}</p>
        <h1>{c.title}</h1>
        <p className="muted">{c.description}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMessage(
              'This form is ready for integration. No credentials were sent or stored, and no verification message was dispatched.',
            );
            e.currentTarget.querySelector<HTMLInputElement>('input[type="password"]')?.focus();
          }}
        >
          {mode === 'signup' && (
            <Input label="Full name" autoComplete="name" required maxLength={100} />
          )}
          {(credentials || mode === 'forgot') && (
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          )}
          {mode === 'activate' && <Input label="Invitation token" autoComplete="off" required />}
          {password && (
            <div className="password-field">
              <Input
                label={mode === 'reset' ? 'New password' : 'Password'}
                type={show ? 'text' : 'password'}
                minLength={mode === 'login' || mode === 'admin' || mode === 'employee' ? 1 : 15}
                maxLength={128}
                autoComplete={
                  mode === 'signup' || mode === 'reset' || mode === 'activate'
                    ? 'new-password'
                    : 'current-password'
                }
                required
              />
              <button
                type="button"
                aria-label={show ? 'Hide password' : 'Show password'}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}
          {mode === 'reset' && <Input label="Reset token" autoComplete="off" required />}
          {mode === 'email' && (
            <Input label="Email verification token" autoComplete="off" required />
          )}
          {mode === 'phone' && (
            <>
              <Input
                label="Phone number"
                type="tel"
                placeholder="+923001234567"
                pattern="\+92[0-9]{10}"
                autoComplete="tel"
                required
              />
              <p className="field__hint">Use the +92 international format.</p>
            </>
          )}
          {['mfa', 'mfa-setup'].includes(mode) && (
            <>
              <Input
                label="Six-digit code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                autoComplete="one-time-code"
                required
              />
            </>
          )}
          {mode === 'recovery' && <Input label="Recovery code" autoComplete="off" required />}
          {mode === 'signup' && (
            <label className="checkbox-label">
              <input type="checkbox" required />I agree to the{' '}
              <Link href="/terms">draft terms</Link> and <Link href="/privacy">privacy policy</Link>
              .
            </label>
          )}
          {['login', 'admin', 'employee'].includes(mode) && (
            <Link href="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          )}
          <Button className="full-width">
            {c.button}
            <ArrowRight size={17} />
          </Button>
          {message && (
            <p className="form-feedback" role="status">
              {message}
            </p>
          )}
        </form>
        {mode === 'login' && (
          <p className="auth-switch">
            New around here? <Link href="/signup">Create an account</Link>
          </p>
        )}
        {mode === 'signup' && (
          <p className="auth-switch">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        )}
        {mode === 'mfa' && (
          <p className="auth-switch">
            <Link href="/staff/mfa/recovery">Use a recovery code</Link>
          </p>
        )}
        {!['login', 'signup'].includes(mode) && (
          <p className="auth-switch">
            <Link href={staff ? '/employee/login' : '/login'}>Back to sign in</Link>
          </p>
        )}
      </section>
    </div>
  );
}
