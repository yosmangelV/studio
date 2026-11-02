import { CACHE_KEY, CACHE_MAX_AGE_MS, isPublicGymProfile, readCache, writeCache } from './gym-profile.cache';
import type { PublicGymProfile } from './gym-profile.model';

const ROW: PublicGymProfile = {
  profile: {
    phone: '+34658078039',
    whatsapp: '34658078039',
    email: null,
    address: 'C. de Lope de Vega, 10',
    instagram: null,
    founded_on: '2024-01-01',
    updated_at: '2026-11-01T10:00:00Z',
  },
  schedule: [
    { day_from: 1, day_to: 5, opens_at: '18:30:00', closes_at: '19:30:00', label: { es: 'Adultos', en: 'Adults' }, sort_order: 0 },
  ],
  classes: [{ name: { es: 'Boxeo' }, description: { es: 'Técnica' }, sort_order: 0 }],
  active_students: null,
};

const NOW = Date.UTC(2026, 10, 2);

describe('gym profile cache', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips a fresh copy', () => {
    writeCache(localStorage, ROW, NOW);
    expect(readCache(localStorage, NOW + 1000)).toEqual(ROW);
  });

  it('drops a copy older than the maximum age', () => {
    writeCache(localStorage, ROW, NOW);
    expect(readCache(localStorage, NOW + CACHE_MAX_AGE_MS + 1)).toBeNull();
    expect(localStorage.getItem(CACHE_KEY)).toBeNull();
  });

  it('drops a tampered copy instead of rendering it', () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: NOW, row: { ...ROW, classes: [{ name: 'x' }] } }));
    expect(readCache(localStorage, NOW)).toBeNull();
    expect(localStorage.getItem(CACHE_KEY)).toBeNull();
  });

  it('ignores malformed JSON', () => {
    localStorage.setItem(CACHE_KEY, '{not json');
    expect(readCache(localStorage, NOW)).toBeNull();
  });

  it('removes the unversioned v1 copy on write', () => {
    localStorage.setItem('gym-profile:v1', JSON.stringify(ROW));
    writeCache(localStorage, ROW, NOW);
    expect(localStorage.getItem('gym-profile:v1')).toBeNull();
  });

  it('survives storage that throws', () => {
    const blocked = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => undefined,
    } as unknown as Storage;
    expect(readCache(blocked, NOW)).toBeNull();
    expect(() => writeCache(blocked, ROW, NOW)).not.toThrow();
  });

  it.each([
    ['null', null],
    ['schedule not an array', { ...ROW, schedule: {} }],
    ['slot with string day', { ...ROW, schedule: [{ ...ROW.schedule[0], day_from: '1' }] }],
    ['label without es', { ...ROW, schedule: [{ ...ROW.schedule[0], label: { en: 'Adults' } }] }],
    ['phone as number', { ...ROW, profile: { ...ROW.profile, phone: 658078039 } }],
    ['active_students as string', { ...ROW, active_students: '20' }],
  ])('rejects %s', (_, value) => {
    expect(isPublicGymProfile(value)).toBe(false);
  });

  it('accepts a profile-less row (no gym_profile yet)', () => {
    expect(isPublicGymProfile({ ...ROW, profile: null })).toBe(true);
  });
});
