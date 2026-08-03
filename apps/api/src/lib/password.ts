import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export function hashPassword(plainTextPassword) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(plainTextPassword, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(plainTextPassword, storedHash) {
  const [rawIterations, salt, hash] = String(storedHash ?? '').split(':');
  const iterations = Number(rawIterations);

  if (!iterations || !salt || !hash) {
    return false;
  }

  const candidate = pbkdf2Sync(plainTextPassword, salt, iterations, KEY_LENGTH, DIGEST);
  const expected = Buffer.from(hash, 'hex');

  if (candidate.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(candidate, expected);
}
