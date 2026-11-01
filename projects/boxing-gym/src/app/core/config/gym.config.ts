import type { GymConfig } from './gym-config.model';

// ─── Marca y textos fijos del gimnasio ──────────────────────────────────────
// Contacto, horarios, clases y cifras se editan desde el panel (/settings) y se
// leen de Supabase: ver core/gym-profile/ y apps/boxing-gym-api/specs/gym-profile.md.

export const gymConfig = {
  name: 'El Arte del Guante',
  subtitle: 'Boxing E.Bote',
  tagline: 'Forja tu carácter en el ring',
  about:
    'Somos una escuela de boxeo comprometida con el deporte, la disciplina y el desarrollo personal. ' +
    'Bajo la dirección de E.Bote, formamos campeones dentro y fuera del ring. ' +
    'Abiertos a todos los niveles — desde principiantes hasta competidores.',

  assets: {
    logoMain: 'assets/logo-main.png',
    logoIllustrated: 'assets/logo-illustrated.png',
    logoSvg: 'assets/logo.svg',
  },

  copyright: `© ${new Date().getFullYear()} El Arte del Guante. Todos los derechos reservados.`,
} satisfies GymConfig;
