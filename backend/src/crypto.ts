import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Algorithm, hash, verify } from '@node-rs/argon2';

/** 256 random bits. Only the SHA-256 of this is ever stored. */
export const newToken = () => randomBytes(32).toString('base64url');
export const sha256 = (value: string) => createHash('sha256').update(value).digest();
export const hmac = (key: string, value: string) =>
  createHmac('sha256', key).update(value).digest();

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// Argon2id with the OWASP minimum cost (19 MiB, 2 passes, 1 lane); salt is generated and
// stored inside the PHC string, so no separate salt column exists.
const options = { algorithm: Algorithm.Argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };
export const hashPassword = (password: string) => hash(password, options);
export const verifyPassword = (phc: string, password: string) =>
  verify(phc, password).catch(() => false);

let dummy: Promise<string> | undefined;
/** Checked when the email is unknown, so a miss costs the same time as a wrong password. */
export const dummyHash = () => (dummy ??= hashPassword(newToken()));
