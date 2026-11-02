import { z } from 'zod';

// Passwords that appear at the top of every breach list. A fuller list can be loaded later.
const COMMON = new Set(
  [
    'password1234',
    'passw0rd1234',
    '123456789012',
    'qwertyuiop12',
    'iloveyou1234',
    'welcome12345',
    'administrator',
    'letmein12345',
    'password12345',
    '1234567890123',
    'qwerty123456',
    'abc123456789',
  ].map((p) => p.toLowerCase()),
);

export const emailSchema = z
  .string()
  .trim()
  .max(254)
  .pipe(z.email())
  .transform((v) => v.normalize('NFC').toLowerCase());

export const newPasswordSchema = z
  .string()
  .min(12, 'Use at least 12 characters.')
  .max(128, 'Use at most 128 characters.')
  .refine((p) => !COMMON.has(p.toLowerCase()), 'That password is too common.');

// .strict() rejects unknown keys, so a client cannot smuggle in fields such as role or realm.
export const signupSchema = z
  .object({
    email: emailSchema,
    password: newPasswordSchema,
    displayName: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .regex(/^[^\u0000-\u001f<>]+$/, 'Remove special characters.'),
  })
  .strict()
  .refine(
    (v) => {
      const local = v.email.split('@')[0] ?? '';
      return local.length < 4 || !v.password.toLowerCase().includes(local);
    },
    { path: ['password'], message: 'The password must not contain your email name.' },
  );

export const loginSchema = z
  .object({ email: emailSchema, password: z.string().min(1).max(128) })
  .strict();
