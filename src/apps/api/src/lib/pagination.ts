import { Type } from '@sinclair/typebox';

export const PAGE_DEFAULT = 1;
export const LIMIT_DEFAULT = 20;
export const MAX_PAGE = 1000;
export const MAX_LIMIT = 100;
export const POSITIVE_INTEGER_PATTERN = '^[1-9][0-9]*$';

const POSITIVE_INTEGER_REGEX = new RegExp(POSITIVE_INTEGER_PATTERN);

export const PositiveIntegerStringSchema = Type.String({
  pattern: POSITIVE_INTEGER_PATTERN,
});

export const toBoundedPositiveInteger = (
  value: number | string | undefined,
  fallback: number,
  maximum: number,
): number => {
  const safeFallback = Math.min(Math.max(fallback, 1), maximum);

  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 1) {
      return safeFallback;
    }

    return Math.min(value, maximum);
  }

  if (typeof value === 'string') {
    if (!POSITIVE_INTEGER_REGEX.test(value)) {
      return safeFallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      return safeFallback;
    }

    return Math.min(parsed, maximum);
  }

  return safeFallback;
};
