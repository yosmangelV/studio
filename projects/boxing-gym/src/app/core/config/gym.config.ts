import type { GymConfig } from './gym-config.model';

// ─── Cambia solo este archivo para adaptar la app a otro gimnasio ───────────

export const gymConfig = {
  name: 'El Arte del Guante',
  subtitle: 'Boxing E.Bote',
  tagline: 'Forja tu carácter en el ring',
  about:
    'Somos una escuela de boxeo comprometida con el deporte, la disciplina y el desarrollo personal. ' +
    'Bajo la dirección de E.Bote, formamos campeones dentro y fuera del ring. ' +
    'Abiertos a todos los niveles — desde principiantes hasta competidores.',

  contact: {
    phone: '+34 XXX XXX XXX',         // TODO: rellenar
    whatsapp: '+34 XXX XXX XXX',      // TODO: rellenar
    email: 'info@arteidelguante.com', // TODO: rellenar
    address: 'Calle X, N.º XX — Ciudad', // TODO: rellenar
    instagram: '@arteidelguante',     // TODO: rellenar
  },

  assets: {
    logoMain: 'assets/logo-main.png',
    logoIllustrated: 'assets/logo-illustrated.png',
    logoSvg: 'assets/logo.svg',
  },

  highlights: [
    { value: '+50', label: 'Alumnos activos' },
    { value: '5+',  label: 'Años formando campeones' },
    { value: '4',   label: 'Modalidades de entrenamiento' },
  ],

  classes: [
    {
      icon: '🥊',
      name: 'Boxeo',
      description: 'Técnica, potencia y resistencia. Aprende el arte del ring desde cero.',
    },
    {
      icon: '💪',
      name: 'Fitness con Saco',
      description: 'Entrenamiento cardiovascular y de fuerza con la intensidad del boxeo.',
    },
    {
      icon: '⭐',
      name: 'Kids Boxing',
      description: 'Disciplina, valores y confianza para los más pequeños de la casa.',
    },
    {
      icon: '🏆',
      name: 'Sparring',
      description: 'Combate controlado y supervisado para alumnos de nivel intermedio-avanzado.',
    },
  ],

  schedule: [
    { day: 'Lunes – Viernes', time: '09:00 – 11:00 · 17:00 – 21:00' },
    { day: 'Sábado',          time: '10:00 – 13:00' },
    { day: 'Domingo',         time: 'Cerrado', closed: true },
  ],

  copyright: `© ${new Date().getFullYear()} El Arte del Guante. Todos los derechos reservados.`,
} satisfies GymConfig;
