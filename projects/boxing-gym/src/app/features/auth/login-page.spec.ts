import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideRouter } from '@angular/router';
import LoginPage from './login-page';
import { GYM_CONFIG } from '../../core/config/gym-config.token';
import { AuthService } from '../../core/auth/auth.service';

const GYM_CONFIG_MOCK = {
  name: 'El Arte del Guante',
  subtitle: 'Boxing E.Bote',
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
  signIn: vi.fn().mockResolvedValue(undefined),
};

const PROVIDERS = [
  provideRouter([]),
  { provide: GYM_CONFIG, useValue: GYM_CONFIG_MOCK },
  { provide: AuthService, useValue: AUTH_SERVICE_MOCK },
];

describe('LoginPage', () => {
  it('renders the login form', async () => {
    await render(LoginPage, { providers: PROVIDERS });
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('renders the email input', async () => {
    await render(LoginPage, { providers: PROVIDERS });
    expect(screen.getByTestId('login-email-input')).toBeInTheDocument();
  });

  it('renders the password input', async () => {
    await render(LoginPage, { providers: PROVIDERS });
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
  });

  it('does not call auth.signIn when submitting an empty form', async () => {
    const user = userEvent.setup();
    AUTH_SERVICE_MOCK.signIn.mockClear();
    await render(LoginPage, { providers: PROVIDERS });
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(AUTH_SERVICE_MOCK.signIn).not.toHaveBeenCalled();
  });

  it('calls auth.signIn with credentials on valid submit', async () => {
    const user = userEvent.setup();
    AUTH_SERVICE_MOCK.signIn.mockClear();
    await render(LoginPage, { providers: PROVIDERS });
    await user.type(screen.getByTestId('login-email-input'), 'test@example.com');
    await user.type(screen.getByTestId('login-password-input'), 'secret123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(AUTH_SERVICE_MOCK.signIn).toHaveBeenCalledWith('test@example.com', 'secret123');
  });

  it('shows error message when signIn rejects', async () => {
    const user = userEvent.setup();
    AUTH_SERVICE_MOCK.signIn.mockRejectedValueOnce(new Error('Invalid credentials'));
    await render(LoginPage, { providers: PROVIDERS });
    await user.type(screen.getByTestId('login-email-input'), 'bad@example.com');
    await user.type(screen.getByTestId('login-password-input'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(await screen.findByTestId('login-error')).toBeInTheDocument();
  });
});
