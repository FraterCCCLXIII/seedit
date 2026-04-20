/** Trim, remove line breaks, and accept pastes like `/s/ADDR` or `.../s/ADDR`. */
export function normalizeSubplebbitAddressInput(raw: string): string {
  let s = raw.trim().replace(/\s+/g, '');
  const pathMatch = s.match(/\/s\/([^/?#]+)/);
  if (pathMatch) {
    try {
      s = decodeURIComponent(pathMatch[1] ?? '');
    } catch {
      s = pathMatch[1] ?? s;
    }
  }
  return s.trim();
}

const MIN_LEN = 10;
const MAX_LEN = 250;

export type SubplebbitAddressValidationErrorKey = 'add_community_error_empty' | 'add_community_error_invalid' | 'add_community_error_duplicate';

/**
 * Lightweight client checks before persisting; the protocol still resolves the subplebbit.
 * `existing` compared with case-sensitive equality (base58 addresses are case-sensitive).
 */
export function validateSubplebbitAddressForSubscription(normalized: string, existing: readonly string[] | undefined): SubplebbitAddressValidationErrorKey | null {
  if (!normalized.length) {
    return 'add_community_error_empty';
  }
  if (normalized.length < MIN_LEN || normalized.length > MAX_LEN) {
    return 'add_community_error_invalid';
  }
  // Letters, digits, dots (ENS), hyphens, underscores — no spaces or slashes left after normalize
  if (!/^[a-zA-Z0-9._-]+$/.test(normalized)) {
    return 'add_community_error_invalid';
  }
  if (existing?.includes(normalized)) {
    return 'add_community_error_duplicate';
  }
  return null;
}
