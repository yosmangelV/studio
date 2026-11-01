// Row shape of the Supabase view `public_gym_profile` (apps/boxing-gym-api/specs/gym-profile.md).

export interface LocalizedText {
  es: string;
  en?: string | null;
}

export interface PublicProfile {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  instagram: string | null;
  founded_on: string | null;
  updated_at: string;
}

export interface PublicScheduleSlot {
  day_from: number;
  day_to: number;
  opens_at: string;
  closes_at: string;
  label: LocalizedText | null;
  sort_order: number;
}

export interface PublicGymClass {
  name: LocalizedText;
  description: LocalizedText;
  sort_order: number;
}

export interface PublicGymProfile {
  profile: PublicProfile | null;
  schedule: PublicScheduleSlot[];
  classes: PublicGymClass[];
  active_students: number | null;
}

// ---- View models: what the home sections render -----------------------------------

export interface LinkView {
  display: string;
  href: string;
}

export interface ContactView {
  phone: LinkView | null;
  whatsappHref: string | null;
  email: LinkView | null;
  address: LinkView | null;
  instagram: LinkView | null;
}

export interface ScheduleSession {
  label: string | null;
  time: string;
}

export interface ScheduleGroup {
  days: string;
  closed: boolean;
  sessions: ScheduleSession[];
}

export interface ClassView {
  name: string;
  description: string;
}

export interface HighlightView {
  value: string;
  label: string;
}
