/**
 * Add-community flow diagnostics. In production, enable with:
 * `localStorage.setItem('seedit:debug:add-community', '1')` then reload.
 * Disable: `localStorage.removeItem('seedit:debug:add-community')`.
 */
const STORAGE_KEY = 'seedit:debug:add-community';

export function isAddCommunityDebugEnabled(): boolean {
  if (import.meta.env.DEV) {
    return true;
  }
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function debugAddCommunity(phase: string, payload?: Record<string, unknown>): void {
  if (!isAddCommunityDebugEnabled()) {
    return;
  }
  if (payload && Object.keys(payload).length > 0) {
    console.debug(`[add-community] ${phase}`, payload);
  } else {
    console.debug(`[add-community] ${phase}`);
  }
}
