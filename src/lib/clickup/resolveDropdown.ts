/**
 * ClickUp Dropdown Resolution Utility
 *
 * ClickUp returns dropdown field values as an integer `orderindex`,
 * not a name or ID. This must be resolved against the field's own
 * `options` array on every sync.
 *
 * Confirmed via direct testing against the live Certifications list.
 */

export interface ClickUpFieldOption {
  id: string;
  name: string;
  orderindex: number;
}

export interface ClickUpCustomField {
  name: string;
  type: string;
  value?: number | string | null;
  type_config?: { options?: ClickUpFieldOption[] };
}

/**
 * Resolves a ClickUp dropdown field's numeric orderindex to its display name.
 *
 * @param field - The custom field object from ClickUp's API response
 * @returns The resolved option name, or null if the value is empty or unmatched
 * @throws Error if called on a non-dropdown field type
 */
export function resolveDropdownValue(field: ClickUpCustomField): string | null {
  if (field.type !== 'drop_down') {
    throw new Error(
      `resolveDropdownValue called on non-dropdown field: ${field.name}`
    );
  }

  if (field.value === undefined || field.value === null) return null;

  const options = field.type_config?.options ?? [];
  const match = options.find((opt) => opt.orderindex === field.value);

  if (!match) {
    console.warn(
      `No option found for orderindex ${field.value} on field "${field.name}"`
    );
    return null;
  }

  return match.name;
}
