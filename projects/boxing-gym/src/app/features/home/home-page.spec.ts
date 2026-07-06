import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import HomePage from './home-page';
import { GYM_CONFIG } from '../../core/config/gym-config.token';

const GYM_CONFIG_MOCK = {
  name: 'El Arte del Guante',
  subtitle: 'Escuela de Boxeo',
  tagline: 'Entrena con los mejores',
  about: 'Somos una escuela con historia.',
  highlights: [
    { value: '10+', label: 'Años de experiencia' },
  ],
  contact: {
    phone: '+34 600 000 000',
    whatsapp: '+34600000000',
    email: 'info@boxingclub.es',
    address: 'Calle del Boxeo 1, Madrid',
  },
  assets: {
    logoMain: '/logo.png',
    logoIllustrated: '/logo-illustrated.png',
    logoSvg: '/logo.svg',
  },
  classes: [
    { icon: '🥊', name: 'Boxeo', description: 'Técnica y condición física' },
  ],
  schedule: [
    { day: 'Lunes', time: '18:00 – 20:00' },
  ],
  copyright: '© 2025 El Arte del Guante',
};

const PROVIDERS = [
  provideRouter([]),
  { provide: GYM_CONFIG, useValue: GYM_CONFIG_MOCK },
  { provide: LOCALE_ID, useValue: 'es' },
];

describe('HomePage', () => {
  it('renders the brand name in the nav', async () => {
    await render(HomePage, { providers: PROVIDERS });
    expect(screen.getByText('El Arte del Guante')).toBeInTheDocument();
  });

  it('renders the about text', async () => {
    await render(HomePage, { providers: PROVIDERS });
    expect(screen.getByText('Somos una escuela con historia.')).toBeInTheDocument();
  });

  it('renders class names', async () => {
    await render(HomePage, { providers: PROVIDERS });
    expect(screen.getByText('Boxeo')).toBeInTheDocument();
  });

  it('renders schedule days', async () => {
    await render(HomePage, { providers: PROVIDERS });
    expect(screen.getByText('Lunes')).toBeInTheDocument();
  });

  it('renders contact section', async () => {
    await render(HomePage, { providers: PROVIDERS });
    expect(screen.getByTestId('contact-section')).toBeInTheDocument();
  });
});
