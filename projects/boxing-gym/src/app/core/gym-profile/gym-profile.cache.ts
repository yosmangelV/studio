import type { LocalizedText, PublicGymProfile } from './gym-profile.model';

/**
 * Last `public_gym_profile` response, kept so repeat visits render instantly.
 * Public data only (the same the landing shows to anyone); see specs/gym-profile.md.
 */
export const CACHE_KEY = 'gym-profile:v2';
const LEGACY_KEYS = ['gym-profile:v1'];

/** Older copies are dropped: better to wait for Supabase than to show a schedule from weeks ago. */
export const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry {
  savedAt: number;
  row: PublicGymProfile;
}

type Shape = Record<string, unknown>;

const isObject = (v: unknown): v is Shape => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStringOrNull = (v: unknown) => v === null || typeof v === 'string';

function isLocalizedText(v: unknown): v is LocalizedText {
  return isObject(v) && typeof v['es'] === 'string' && (v['en'] === undefined || isStringOrNull(v['en']));
}

function isScheduleSlot(v: unknown): boolean {
  return (
    isObject(v) &&
    typeof v['day_from'] === 'number' &&
    typeof v['day_to'] === 'number' &&
    typeof v['opens_at'] === 'string' &&
    typeof v['closes_at'] === 'string' &&
    (v['label'] === null || isLocalizedText(v['label']))
  );
}

function isGymClass(v: unknown): boolean {
  return isObject(v) && isLocalizedText(v['name']) && isLocalizedText(v['description']);
}

function isProfile(v: unknown): boolean {
  return (
    v === null ||
    (isObject(v) &&
      ['phone', 'whatsapp', 'email', 'address', 'instagram', 'founded_on'].every((k) => isStringOrNull(v[k] ?? null)))
  );
}

/** Storage is writable by anything running on the origin, so its contents are checked, not trusted. */
export function isPublicGymProfile(v: unknown): v is PublicGymProfile {
  return (
    isObject(v) &&
    isProfile(v['profile']) &&
    Array.isArray(v['schedule']) &&
    v['schedule'].every(isScheduleSlot) &&
    Array.isArray(v['classes']) &&
    v['classes'].every(isGymClass) &&
    (v['active_students'] === null || typeof v['active_students'] === 'number')
  );
}

export function readCache(storage: Storage, now: number): PublicGymProfile | null {
  try {
    const raw = storage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: unknown = JSON.parse(raw);
    const fresh =
      isObject(entry) &&
      typeof entry['savedAt'] === 'number' &&
      now - entry['savedAt'] <= CACHE_MAX_AGE_MS &&
      isPublicGymProfile(entry['row']);
    if (fresh) return (entry as unknown as CacheEntry).row;
    storage.removeItem(CACHE_KEY);
    return null;
  } catch {
    return null;
  }
}

export function writeCache(storage: Storage, row: PublicGymProfile, now: number): void {
  try {
    const entry: CacheEntry = { savedAt: now, row };
    storage.setItem(CACHE_KEY, JSON.stringify(entry));
    LEGACY_KEYS.forEach((key) => storage.removeItem(key));
  } catch {
    // Storage full or blocked: the page still renders from the live response.
  }
}
