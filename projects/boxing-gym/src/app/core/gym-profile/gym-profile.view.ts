import type {
  ClassView,
  ContactView,
  HighlightView,
  LocalizedText,
  PublicGymProfile,
  PublicProfile,
  PublicScheduleSlot,
  ScheduleGroup,
} from './gym-profile.model';

// Pure mapping from the public view row to what the home sections render.
// No Angular here, so every rule is unit-testable.

export function localize(text: LocalizedText, locale: string): string {
  const lang = locale.slice(0, 2) as keyof LocalizedText;
  return text[lang] || text.es;
}

/** +34658078039 → "+34 658 078 039"; other countries are shown as stored. */
export function formatPhone(e164: string): string {
  const spain = e164.match(/^\+34(\d{3})(\d{3})(\d{3})$/);
  return spain ? `+34 ${spain[1]} ${spain[2]} ${spain[3]}` : e164;
}

export function toContactView(profile: PublicProfile | null): ContactView {
  return {
    phone: profile?.phone ? { display: formatPhone(profile.phone), href: `tel:${profile.phone}` } : null,
    whatsappHref: profile?.whatsapp ? `https://wa.me/${profile.whatsapp}` : null,
    email: profile?.email ? { display: profile.email, href: `mailto:${profile.email}` } : null,
    address: profile?.address
      ? {
          display: profile.address,
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`,
        }
      : null,
    instagram: profile?.instagram
      ? { display: `@${profile.instagram}`, href: `https://instagram.com/${profile.instagram}` }
      : null,
  };
}

const ISO_MONDAY = Date.UTC(2024, 0, 1); // 2024-01-01 was a Monday
const DAY_MS = 86_400_000;

function weekday(isoDay: number, locale: string): string {
  const name = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' })
    .format(new Date(ISO_MONDAY + (isoDay - 1) * DAY_MS));
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

function dayRange(from: number, to: number, locale: string): string {
  return from === to ? weekday(from, locale) : `${weekday(from, locale)} – ${weekday(to, locale)}`;
}

const hhmm = (time: string) => time.slice(0, 5);

/**
 * Groups slots by day range (in slot order) and adds the days no slot covers as
 * closed ranges, so a missing day is never silently omitted.
 */
export function groupSchedule(slots: PublicScheduleSlot[], locale: string, closedLabel: string): ScheduleGroup[] {
  const ordered = [...slots].sort((a, b) => a.sort_order - b.sort_order);
  const groups = new Map<string, ScheduleGroup & { from: number }>();

  for (const slot of ordered) {
    const key = `${slot.day_from}-${slot.day_to}`;
    if (!groups.has(key)) {
      groups.set(key, { days: dayRange(slot.day_from, slot.day_to, locale), closed: false, sessions: [], from: slot.day_from });
    }
    groups.get(key)!.sessions.push({
      label: slot.label ? localize(slot.label, locale) : null,
      time: `${hhmm(slot.opens_at)} – ${hhmm(slot.closes_at)}`,
    });
  }

  const covered = new Set(ordered.flatMap((s) => Array.from({ length: s.day_to - s.day_from + 1 }, (_, i) => s.day_from + i)));
  let runStart: number | null = null;
  for (let day = 1; day <= 8; day++) {
    const open = day === 8 || covered.has(day);
    if (!open && runStart === null) runStart = day;
    if (open && runStart !== null) {
      groups.set(`closed-${runStart}`, {
        days: dayRange(runStart, day - 1, locale),
        closed: true,
        sessions: [{ label: null, time: closedLabel }],
        from: runStart,
      });
      runStart = null;
    }
  }

  // Order by first day; ties keep slot order (Map insertion order is stable in sort).
  return [...groups.values()]
    .sort((a, b) => a.from - b.from)
    .map(({ from: _from, ...group }) => group);
}

export function toClassViews(row: PublicGymProfile | null, locale: string): ClassView[] {
  return (row?.classes ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({ name: localize(c.name, locale), description: localize(c.description, locale) }));
}

export function yearsSince(isoDate: string, today: Date): number {
  const start = new Date(`${isoDate}T00:00:00Z`);
  let years = today.getUTCFullYear() - start.getUTCFullYear();
  const beforeAnniversary =
    today.getUTCMonth() < start.getUTCMonth() ||
    (today.getUTCMonth() === start.getUTCMonth() && today.getUTCDate() < start.getUTCDate());
  if (beforeAnniversary) years--;
  return Math.max(years, 0);
}

export interface HighlightLabels {
  activeStudents: string;
  year: string;
  years: string;
  modalities: string;
}

/** Only real, meaningful figures: each one is omitted when its source is missing or zero. */
export function toHighlights(row: PublicGymProfile | null, today: Date, labels: HighlightLabels): HighlightView[] {
  if (!row) return [];
  const highlights: HighlightView[] = [];

  if (row.active_students) {
    highlights.push({ value: `+${row.active_students}`, label: labels.activeStudents });
  }
  const years = row.profile?.founded_on ? yearsSince(row.profile.founded_on, today) : 0;
  if (years >= 1) {
    highlights.push({ value: String(years), label: years === 1 ? labels.year : labels.years });
  }
  if (row.classes.length) {
    highlights.push({ value: String(row.classes.length), label: labels.modalities });
  }
  return highlights;
}
