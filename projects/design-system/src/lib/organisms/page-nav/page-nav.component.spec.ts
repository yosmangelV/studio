import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { PageNavComponent } from './page-nav.component';

const BASE_INPUTS = {
  brandName:     'Boxing Club',
  brandSubtitle: 'Escuela de Boxeo',
  links: [
    { label: 'Nosotros', href: '#about' },
    { label: 'Clases',   href: '#classes' },
    { label: 'Contacto', href: '#contact' },
  ],
};

describe('PageNavComponent', () => {
  it('renders brand name', async () => {
    await render(PageNavComponent, { componentInputs: BASE_INPUTS });
    expect(screen.getByText('Boxing Club')).toBeInTheDocument();
  });

  it('renders brand subtitle', async () => {
    await render(PageNavComponent, { componentInputs: BASE_INPUTS });
    expect(screen.getByText('Escuela de Boxeo')).toBeInTheDocument();
  });

  it('renders all nav link labels', async () => {
    await render(PageNavComponent, { componentInputs: BASE_INPUTS });
    expect(screen.getByText('Nosotros')).toBeInTheDocument();
    expect(screen.getByText('Clases')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  it('renders nav links as anchor elements', async () => {
    const { container } = await render(PageNavComponent, { componentInputs: BASE_INPUTS });
    const links = container.querySelectorAll('a.page-nav__link');
    expect(links).toHaveLength(3);
  });

  it('nav links have correct href attributes', async () => {
    const { container } = await render(PageNavComponent, { componentInputs: BASE_INPUTS });
    const links = container.querySelectorAll<HTMLAnchorElement>('a.page-nav__link');
    expect(links[0].getAttribute('href')).toBe('#about');
    expect(links[1].getAttribute('href')).toBe('#classes');
  });

  it('renders CTA button with default label', async () => {
    await render(PageNavComponent, { componentInputs: BASE_INPUTS });
    expect(screen.getByRole('button', { name: 'Acceder' })).toBeInTheDocument();
  });

  it('renders CTA button with custom label', async () => {
    await render(PageNavComponent, {
      componentInputs: { ...BASE_INPUTS, ctaLabel: 'Iniciar sesión' },
    });
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('emits ctaClick when CTA button is clicked', async () => {
    const user = userEvent.setup();
    const ctaClickSpy = vi.fn();
    await render(PageNavComponent, {
      componentInputs: BASE_INPUTS,
      componentOutputs: { ctaClick: { emit: ctaClickSpy } as any },
    });
    await user.click(screen.getByRole('button', { name: 'Acceder' }));
    expect(ctaClickSpy).toHaveBeenCalledOnce();
  });
});
