import { signal } from '@angular/core';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { App, MAX_SPLASH_MS, MIN_SPLASH_MS } from './app';
import { GymProfileService } from './core/gym-profile/gym-profile.service';

function setup(path: string, { hasCache = false, query = '' } = {}) {
  const settled = signal(hasCache);
  const gymProfile = { hasCache, settled };
  const view = render(App, {
    providers: [
      provideRouter([{ path: '**', children: [] }]),
      {
        provide: Location,
        useFactory: () => {
          const location = new SpyLocation();
          location.go(path, query);
          return location;
        },
      },
      { provide: GymProfileService, useValue: gymProfile },
    ],
  });
  return { view, settled };
}

const splash = () => screen.queryByTestId('loading-overlay');

describe('App splash', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows on a first landing visit until the data arrives and the minimum has passed', async () => {
    const { view, settled } = setup('');
    const { detectChanges } = await view;
    expect(splash()).toBeInTheDocument();

    settled.set(true);
    detectChanges();
    expect(splash()).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(MIN_SPLASH_MS);
    detectChanges();
    await vi.runAllTimersAsync();
    expect(splash()).not.toBeInTheDocument();
  });

  it('gives up waiting for data after the maximum', async () => {
    const { view } = setup('');
    const { detectChanges } = await view;

    await vi.advanceTimersByTimeAsync(MAX_SPLASH_MS);
    detectChanges();
    await vi.runAllTimersAsync();
    expect(splash()).not.toBeInTheDocument();
  });

  it('is skipped when a cached copy exists', async () => {
    await setup('', { hasCache: true }).view;
    expect(splash()).not.toBeInTheDocument();
  });

  it.each(['/login', '/students', '/settings?tab=1'])('is skipped on %s', async (path) => {
    await setup(path).view;
    expect(splash()).not.toBeInTheDocument();
  });

  it('keeps the query string out of the landing check', async () => {
    await setup('', { query: 'utm_source=instagram' }).view;
    expect(splash()).toBeInTheDocument();
  });
});
