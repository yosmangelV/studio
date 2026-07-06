import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideRouter } from '@angular/router';
import { ShellComponent } from './shell.component';
import { GYM_CONFIG } from '../../core/config/gym-config.token';
import { AuthService } from '../../core/auth/auth.service';

const GYM_CONFIG_MOCK = {
  name: 'Boxing Club',
  subtitle: 'Escuela de Boxeo',
  tagline: '',
  about: '',
  highlights: [],
  contact: { phone: '', whatsapp: '', email: '', address: '' },
  assets: { logoMain: '/logo.png', logoIllustrated: '', logoSvg: '' },
  classes: [],
  schedule: [],
  copyright: '© 2025',
};

const AUTH_SERVICE_MOCK = {
  signOut: vi.fn().mockResolvedValue(undefined),
  currentUser: () => null,
  isAuthenticated: () => false,
};

const PROVIDERS = [
  provideRouter([]),
  { provide: GYM_CONFIG, useValue: GYM_CONFIG_MOCK },
  { provide: AuthService, useValue: AUTH_SERVICE_MOCK },
];

describe('ShellComponent', () => {
  it('renders the menu toggle button', async () => {
    await render(ShellComponent, { providers: PROVIDERS });
    expect(screen.getByTestId('shell-menu-btn')).toBeInTheDocument();
  });

  it('does not show overlay when sidebar is closed', async () => {
    await render(ShellComponent, { providers: PROVIDERS });
    expect(screen.queryByTestId('shell-overlay')).not.toBeInTheDocument();
  });

  it('shows overlay after clicking the menu button', async () => {
    const user = userEvent.setup();
    await render(ShellComponent, { providers: PROVIDERS });
    await user.click(screen.getByTestId('shell-menu-btn'));
    expect(screen.getByTestId('shell-overlay')).toBeInTheDocument();
  });
});
