import { render, screen } from '@testing-library/angular';
import { LOCALE_ID } from '@angular/core';
import { LocaleSwitcherComponent } from './locale-switcher.component';

describe('LocaleSwitcherComponent', () => {
  it('renders a button to switch locale', async () => {
    await render(LocaleSwitcherComponent, {
      providers: [{ provide: LOCALE_ID, useValue: 'es' }],
    });
    expect(screen.getByTestId('locale-switcher-btn')).toBeInTheDocument();
  });

  it('shows the alternate locale label when current locale is es', async () => {
    await render(LocaleSwitcherComponent, {
      providers: [{ provide: LOCALE_ID, useValue: 'es' }],
    });
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('shows the alternate locale label when current locale is en', async () => {
    await render(LocaleSwitcherComponent, {
      providers: [{ provide: LOCALE_ID, useValue: 'en' }],
    });
    expect(screen.getByText('Español')).toBeInTheDocument();
  });
});
