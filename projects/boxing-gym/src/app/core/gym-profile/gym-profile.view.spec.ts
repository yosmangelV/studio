import type { PublicGymProfile, PublicScheduleSlot } from './gym-profile.model';
import {
  formatPhone,
  groupSchedule,
  localize,
  toClassViews,
  toContactView,
  toHighlights,
  yearsSince,
} from './gym-profile.view';

const slot = (day_from: number, day_to: number, opens_at: string, closes_at: string, label: string | null, sort_order: number): PublicScheduleSlot => ({
  day_from, day_to, opens_at, closes_at, sort_order,
  label: label ? { es: label, en: `${label} (en)` } : null,
});

const REAL_SCHEDULE: PublicScheduleSlot[] = [
  slot(2, 4, '11:00:00', '12:00:00', 'Abierta a todos', 0),
  slot(1, 5, '17:30:00', '18:30:00', 'Juniors', 1),
  slot(1, 5, '18:30:00', '19:30:00', 'Adultos', 2),
  slot(1, 5, '19:30:00', '20:30:00', 'Adultos', 3),
  slot(1, 5, '20:30:00', '21:30:00', 'Adultos', 4),
];

const ROW: PublicGymProfile = {
  profile: {
    phone: '+34658078039',
    whatsapp: '34658078039',
    email: null,
    address: 'C. de Lope de Vega, 10, 28350 Ciempozuelos, Madrid',
    instagram: null,
    founded_on: '2024-01-01',
    updated_at: '2026-10-31T10:00:00Z',
  },
  schedule: REAL_SCHEDULE,
  classes: [
    { name: { es: 'Sparring' }, description: { es: 'Combate' }, sort_order: 1 },
    { name: { es: 'Boxeo', en: 'Boxing' }, description: { es: 'Técnica', en: 'Technique' }, sort_order: 0 },
  ],
  active_students: null,
};

const LABELS = { activeStudents: 'Alumnos activos', year: 'Año', years: 'Años', modalities: 'Modalidades' };

describe('localize', () => {
  it('uses the requested language and falls back to es', () => {
    expect(localize({ es: 'Boxeo', en: 'Boxing' }, 'en-US')).toBe('Boxing');
    expect(localize({ es: 'Sparring' }, 'en')).toBe('Sparring');
    expect(localize({ es: 'Juniors', en: '' }, 'en')).toBe('Juniors');
  });
});

describe('contact', () => {
  it('formats Spanish numbers for display and keeps E.164 in the link', () => {
    expect(formatPhone('+34658078039')).toBe('+34 658 078 039');
    expect(formatPhone('+4930123456')).toBe('+4930123456');
  });

  it('builds links and hides every empty field', () => {
    const view = toContactView(ROW.profile);
    expect(view.phone).toEqual({ display: '+34 658 078 039', href: 'tel:+34658078039' });
    expect(view.whatsappHref).toBe('https://wa.me/34658078039');
    expect(view.address?.href).toBe(
      'https://www.google.com/maps/search/?api=1&query=C.%20de%20Lope%20de%20Vega%2C%2010%2C%2028350%20Ciempozuelos%2C%20Madrid',
    );
    expect(view.email).toBeNull();
    expect(view.instagram).toBeNull();
  });

  it('shows nothing when there is no profile yet', () => {
    expect(toContactView(null)).toEqual({ phone: null, whatsappHref: null, email: null, address: null, instagram: null });
  });
});

describe('groupSchedule', () => {
  const groups = groupSchedule(REAL_SCHEDULE, 'es', 'Cerrado');

  it('groups by day range in weekday order and adds closed days', () => {
    expect(groups.map((g) => g.days)).toEqual(['Lunes – Viernes', 'Martes – Jueves', 'Sábado – Domingo']);
    expect(groups[2]).toEqual({ days: 'Sábado – Domingo', closed: true, sessions: [{ label: null, time: 'Cerrado' }] });
  });

  it('keeps contiguous sessions separate and in slot order', () => {
    expect(groups[0].sessions).toEqual([
      { label: 'Juniors', time: '17:30 – 18:30' },
      { label: 'Adultos', time: '18:30 – 19:30' },
      { label: 'Adultos', time: '19:30 – 20:30' },
      { label: 'Adultos', time: '20:30 – 21:30' },
    ]);
  });

  it('localizes day names and labels', () => {
    const en = groupSchedule(REAL_SCHEDULE, 'en', 'Closed');
    expect(en[0].days).toBe('Monday – Friday');
    expect(en[1].sessions[0].label).toBe('Abierta a todos (en)');
    expect(en[2].days).toBe('Saturday – Sunday');
  });

  it('marks every day closed when there are no slots', () => {
    expect(groupSchedule([], 'es', 'Cerrado')).toEqual([
      { days: 'Lunes – Domingo', closed: true, sessions: [{ label: null, time: 'Cerrado' }] },
    ]);
  });

  it('splits non-contiguous closed days', () => {
    const days = groupSchedule([slot(2, 2, '10:00:00', '11:00:00', null, 0)], 'es', 'Cerrado').map((g) => g.days);
    expect(days).toEqual(['Lunes', 'Martes', 'Miércoles – Domingo']);
  });
});

describe('classes', () => {
  it('orders by sort_order and localizes', () => {
    expect(toClassViews(ROW, 'en')).toEqual([
      { name: 'Boxing', description: 'Technique' },
      { name: 'Sparring', description: 'Combate' },
    ]);
  });
});

describe('highlights', () => {
  const today = new Date(Date.UTC(2026, 9, 31));

  it('counts whole years since the founding date', () => {
    expect(yearsSince('2024-01-01', today)).toBe(2);
    expect(yearsSince('2024-11-15', today)).toBe(1);
    expect(yearsSince('2026-01-01', today)).toBe(0);
  });

  it('shows only figures that have a real source', () => {
    expect(toHighlights(ROW, today, LABELS)).toEqual([
      { value: '2', label: 'Años' },
      { value: '2', label: 'Modalidades' },
    ]);
  });

  it('shows active students when the database publishes them', () => {
    expect(toHighlights({ ...ROW, active_students: 50 }, today, LABELS)[0]).toEqual({ value: '+50', label: 'Alumnos activos' });
  });

  it('uses the singular label for one year and hides zero years', () => {
    const oneYear = { ...ROW, profile: { ...ROW.profile!, founded_on: '2025-06-01' } };
    expect(toHighlights(oneYear, today, LABELS)[0]).toEqual({ value: '1', label: 'Año' });
    const recent = { ...ROW, profile: { ...ROW.profile!, founded_on: '2026-06-01' } };
    expect(toHighlights(recent, today, LABELS).map((h) => h.label)).toEqual(['Modalidades']);
  });

  it('shows nothing before the first response', () => {
    expect(toHighlights(null, today, LABELS)).toEqual([]);
  });
});
