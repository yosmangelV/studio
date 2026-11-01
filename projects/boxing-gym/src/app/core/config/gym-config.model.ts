// Brand and fixed copy only. Contact, schedule, classes and figures live in Supabase
// and are read by GymProfileService (apps/boxing-gym-api/specs/gym-profile.md).

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
  assets: GymAssets;
  copyright: string;
}
