export interface GymClass {
  icon: string;
  name: string;
  description: string;
}

export interface GymHighlight {
  value: string;
  label: string;
}

export interface ScheduleEntry {
  day: string;
  time: string;
  closed?: boolean;
}

export interface GymContact {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram?: string;
  facebook?: string;
}

export interface GymAssets {
  logoMain: string;
  logoIllustrated: string;
  logoSvg: string;
}

export interface GymConfig {
  name: string;
  subtitle: string;
  tagline: string;
  about: string;
  highlights: GymHighlight[];
  contact: GymContact;
  assets: GymAssets;
  classes: GymClass[];
  schedule: ScheduleEntry[];
  copyright: string;
}
