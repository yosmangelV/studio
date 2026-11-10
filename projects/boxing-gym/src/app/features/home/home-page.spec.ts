import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import HomePage from './home-page';
import { GYM_CONFIG } from '../../core/config/gym-config.token';
import { SUPABASE_CLIENT } from '../../core/auth/supabase.token';
import type { PublicGymProfile } from '../../core/gym-profile/gym-profile.model';
import { CACHE_KEY, writeCache } from '../../core/gym-profile/gym-profile.cache';

const GYM_CONFIG_MOCK = {
  name: 'El Arte del Guante',
  subtitle: 'Escuela de Boxeo',
  tagline: 'Entrena con los mejores',
  about: 'Somos una escuela con historia.',
  assets: {
    logoMain: '/logo.png',
    logoIllustrated: '/logo-illustrated.png',
    logoSvg: '/logo.svg',
  },
  copyright: '© 2025 El Arte del Guante',
};

const PROFILE: NonNullable<PublicGymProfile['profile']> = {
  phone: '+34658078039',
  whatsapp: '34658078039',
  email: null,
  address: 'C. de Lope de Vega, 10, 28350 Ciempozuelos, Madrid',
  instagram: null,
  founded_on: '2024-01-01',
  updated_at: '2026-10-31T10:00:00Z',
};

const ROW: PublicGymProfile = {
  profile: PROFILE,
  schedule: [
    { day_from: 1, day_to: 5, opens_at: '18:30:00', closes_at: '19:30:00', label: { es: 'Adultos' }, sort_order: 0 },
  ],
  classes: [{ name: { es: 'Boxeo' }, description: { es: 'Técnica y condición física' }, sort_order: 0 }],
  active_students: null,
};

function supabaseReturning(result: { data: PublicGymProfile | null; error: unknown }) {
  return { from: () => ({ select: () => ({ single: async () => result }) }) };
}

const providers = (supabase: unknown) => [
  provideRouter([]),
  { provide: GYM_CONFIG, useValue: GYM_CONFIG_MOCK },
  { provide: SUPABASE_CLIENT, useValue: supabase },
  { provide: LOCALE_ID, useValue: 'es' },
];

describe('HomePage', () => {
  beforeEach(() => localStorage.clear());

  it('renders brand and fixed copy without waiting for data', async () => {
    await render(HomePage, { providers: providers(supabaseReturning({ data: null, error: new Error('offline') })) });
    expect(screen.getByText('El Arte del Guante')).toBeInTheDocument();
    expect(screen.getByText('Somos una escuela con historia.')).toBeInTheDocument();
  });

  it('renders classes, schedule and contact from Supabase', async () => {
    await render(HomePage, { providers: providers(supabaseReturning({ data: ROW, error: null })) });
    expect(await screen.findByText('Boxeo')).toBeInTheDocument();
    expect(screen.getByText('Lunes – Viernes')).toBeInTheDocument();
    expect(screen.getByText('Adultos')).toBeInTheDocument();
    expect(screen.getByTestId('contact-phone')).toHaveTextContent('+34 658 078 039');
    expect(screen.queryByTestId('contact-email')).not.toBeInTheDocument();
  });

  it('falls back to the cached copy when Supabase fails', async () => {
    writeCache(localStorage, ROW, Date.now());
    await render(HomePage, { providers: providers(supabaseReturning({ data: null, error: new Error('offline') })) });
    expect(await screen.findByText('Boxeo')).toBeInTheDocument();
    expect(screen.getByTestId('contact-whatsapp')).toHaveAttribute('href', 'https://wa.me/34658078039');
  });

  it('makes WhatsApp the hero primary action and classes the secondary', async () => {
    await render(HomePage, { providers: providers(supabaseReturning({ data: ROW, error: null })) });
    await screen.findByTestId('contact-whatsapp'); // the profile has loaded
    const primary = screen.getByTestId('ds-hero-cta-primary');
    expect(primary).toHaveTextContent('Escríbenos por WhatsApp');
    expect(primary).toHaveAttribute('href', 'https://wa.me/34658078039');
    const secondary = screen.getByTestId('ds-hero-cta-secondary');
    expect(secondary).toHaveTextContent('Ver clases');
    expect(secondary).toHaveAttribute('href', '#classes');
  });

  it('points the hero primary action at the contact section when there is no WhatsApp', async () => {
    await render(HomePage, { providers: providers(supabaseReturning({ data: { ...ROW, profile: { ...PROFILE, whatsapp: null } }, error: null })) });
    await screen.findByTestId('contact-phone'); // the profile has loaded (no WhatsApp link to wait for)
    const primary = screen.getByTestId('ds-hero-cta-primary');
    expect(primary).toHaveTextContent('Contáctanos');
    expect(primary).toHaveAttribute('href', '#contact');
    expect(screen.getByTestId('ds-hero-cta-secondary')).toHaveAttribute('href', '#classes');
    expect(screen.queryByRole('link', { name: 'Escríbenos por WhatsApp' })).not.toBeInTheDocument();
  });

  it('caches a successful response for the next visit', async () => {
    await render(HomePage, { providers: providers(supabaseReturning({ data: ROW, error: null })) });
    await screen.findByText('Boxeo');
    expect(JSON.parse(localStorage.getItem(CACHE_KEY)!).row).toEqual(ROW);
  });
});
