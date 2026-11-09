import type { ProductAddonGroup } from '../types';

export type AddonValidation = {
  valid: boolean;
  /** group id -> message key + params, for groups that need attention */
  errors: Record<number, { key: 'foodChooseAtLeast' | 'foodChooseUpTo'; count: number }>;
};

/** Minimum picks for a group; mirrors stores/addons.py price_addons(). */
export function groupMinimum(group: ProductAddonGroup): number {
  return group.required ? Math.max(group.min_select, 1) : group.min_select;
}

export function validateAddonSelection(groups: ProductAddonGroup[], selected: number[]): AddonValidation {
  const chosen = new Set(selected);
  const errors: AddonValidation['errors'] = {};
  for (const group of groups) {
    const count = group.addons.filter((addon) => chosen.has(addon.id)).length;
    const minimum = groupMinimum(group);
    if ((group.required || count > 0) && count < minimum) {
      errors[group.id] = { key: 'foodChooseAtLeast', count: minimum };
    } else if (group.max_select && count > group.max_select) {
      errors[group.id] = { key: 'foodChooseUpTo', count: group.max_select };
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

/** Toggle an add-on; single-choice groups (max 1) behave like radio buttons. */
export function toggleAddon(group: ProductAddonGroup, selected: number[], addonId: number): number[] {
  const groupIds = new Set(group.addons.map((addon) => addon.id));
  if (selected.includes(addonId)) return selected.filter((id) => id !== addonId);
  if (group.max_select === 1) {
    return [...selected.filter((id) => !groupIds.has(id)), addonId];
  }
  const inGroup = selected.filter((id) => groupIds.has(id)).length;
  if (group.max_select && inGroup >= group.max_select) return selected;
  return [...selected, addonId];
}

/** Display-only estimate; the server quote is what the customer is charged. */
export function addonExtra(groups: ProductAddonGroup[], selected: number[]): number {
  const chosen = new Set(selected);
  let total = 0;
  for (const group of groups) {
    for (const addon of group.addons) {
      if (chosen.has(addon.id)) total += Number(addon.price) || 0;
    }
  }
  return Math.round(total * 100) / 100;
}
