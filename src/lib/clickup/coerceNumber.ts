/**
 * Number Coercion Utility
 *
 * ClickUp stringifies `number`-type custom field values in its API responses.
 * All numeric fields must be coerced explicitly to avoid type mismatches.
 */

/**
 * Safely coerces a value to a number.
 *
 * @param value - The value to coerce (typically a string from ClickUp API)
 * @returns The parsed number, or null if the value is empty/invalid
 */
export function coerceNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
