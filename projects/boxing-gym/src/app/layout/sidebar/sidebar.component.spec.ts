import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { GYM_CONFIG } from '../../core/config/gym-config.token';
import { AuthService } from '../../core/auth/auth.service';

@Component({ standalone: true, template: '' })
class StubRouteComponent {}

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
  isAdmin: () => false,
  isInstructor: () => false,
  isStudent: () => false,
};

const PROVIDERS = [
  provideRouter([{ path: '**', component: StubRouteComponent }]),
  { provide: GYM_CONFIG, useValue: GYM_CONFIG_MOCK },
  { provide: AuthService, useValue: AUTH_SERVICE_MOCK },
];

describe('SidebarComponent', () => {
  it('renders the gym name', async () => {
    await render(SidebarComponent, {
      componentInputs: { open: false },
      providers: PROVIDERS,
    });
    expect(screen.getByTestId('sidebar-gym-name')).toHaveTextContent('Boxing Club');
  });

  it('renders nav items visible to non-admin', async () => {
    await render(SidebarComponent, {
      componentInputs: { open: false },
      providers: PROVIDERS,
    });
    expect(screen.getByText('Alumnos')).toBeInTheDocument();
    expect(screen.getByText('Pedidos')).toBeInTheDocument();
    expect(screen.getByText('Clases')).toBeInTheDocument();
    expect(screen.queryByText('Pagos')).not.toBeInTheDocument();
  });

  it('renders Pagos nav item for admin user', async () => {
    const adminProviders = [
      ...PROVIDERS.slice(0, -1),
      { provide: AuthService, useValue: { ...AUTH_SERVICE_MOCK, isAdmin: () => true } },
    ];
    await render(SidebarComponent, {
      componentInputs: { open: false },
      providers: adminProviders,
    });
    expect(screen.getByText('Pagos')).toBeInTheDocument();
  });

  it('renders "Pronto" badges on disabled nav items', async () => {
    await render(SidebarComponent, {
      componentInputs: { open: false },
      providers: PROVIDERS,
    });
    const badges = screen.getAllByText('Pronto');
    expect(badges).toHaveLength(2);
  });

  it('calls auth.signOut when sign-out button is clicked', async () => {
    AUTH_SERVICE_MOCK.signOut.mockClear();
    const { fixture } = await render(SidebarComponent, {
      componentInputs: { open: false },
      providers: PROVIDERS,
    });
    screen.getByTestId('sidebar-signout-btn').click();
    await fixture.whenStable();
    expect(AUTH_SERVICE_MOCK.signOut).toHaveBeenCalled();
  });
});
