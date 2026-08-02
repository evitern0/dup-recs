import { MAX_TEXT_LENGTH } from './constants.js';

export function isEmail(value) {
  return typeof value === 'string' && /.+@.+\..+/.test(value.trim());
}

export function assertLength(value, max = MAX_TEXT_LENGTH, fieldName = 'value') {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  if (value.trim().length === 0) {
    throw new Error(`${fieldName} is required`);
  }

  if (value.length > max) {
    throw new Error(`${fieldName} must be at most ${max} characters`);
  }
}

export function assertUsername(value) {
  if (typeof value !== 'string' || value.trim().length < 3) {
    throw new Error('username must be at least 3 characters');
  }
}

export function normalizePaginationLimit(value, fallback = 10, max = 50) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, max);
}
