import { fireEvent, render, screen, within } from '@testing-library/angular';
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

  // jsdom applies the component styles but no media query, so these tests run in
  // the narrow layout: the bar's links and CTA exist but are hidden below 768px.
  it('renders all nav link labels in the bar', async () => {
    const { container } = await render(PageNavComponent, { componentInputs: BASE_INPUTS });
    const bar = within(container.querySelector<HTMLElement>('.page-nav__links')!);
    expect(bar.getByText('Nosotros')).toBeInTheDocument();
    expect(bar.getByText('Clases')).toBeInTheDocument();
    expect(bar.getByText('Contacto')).toBeInTheDocument();
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
    const { container } = await render(PageNavComponent, { componentInputs: BASE_INPUTS });
    expect(container.querySelector('.page-nav__cta')).toHaveTextContent('Acceder');
    expect(container.querySelector('.page-nav-menu__cta')).toHaveTextContent('Acceder');
  });

  it('renders CTA button with custom label', async () => {
    const { container } = await render(PageNavComponent, {
      componentInputs: { ...BASE_INPUTS, ctaLabel: 'Iniciar sesión' },
    });
    expect(container.querySelector('.page-nav__cta')).toHaveTextContent('Iniciar sesión');
    expect(container.querySelector('.page-nav-menu__cta')).toHaveTextContent('Iniciar sesión');
  });

  it('emits ctaClick when the bar CTA is clicked', async () => {
    const ctaClickSpy = vi.fn();
    const { container } = await render(PageNavComponent, {
      componentInputs: BASE_INPUTS,
      componentOutputs: { ctaClick: { emit: ctaClickSpy } as any },
    });
    fireEvent.click(container.querySelector<HTMLButtonElement>('.page-nav__cta')!);
    expect(ctaClickSpy).toHaveBeenCalledOnce();
  });

  // The menu's own behaviour is covered in page-nav-menu.component.spec.ts.
  describe('with the narrow-screen menu', () => {
    it('renders the menu inside the bar with the same links', async () => {
      const user = userEvent.setup();
      await render(PageNavComponent, { componentInputs: { ...BASE_INPUTS, menuLabel: 'Menu' } });
      const button = screen.getByTestId('ds-page-nav-menu-button');
      expect(button).toHaveAccessibleName('Menu');
      await user.click(button);
      const panel = within(screen.getByTestId('ds-page-nav-menu'));
      expect(panel.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['#about', '#classes', '#contact']);
    });

    it('emits ctaClick when the menu CTA is chosen', async () => {
      const user = userEvent.setup();
      const ctaClickSpy = vi.fn();
      await render(PageNavComponent, {
        componentInputs: BASE_INPUTS,
        componentOutputs: { ctaClick: { emit: ctaClickSpy } as any },
      });
      await user.click(screen.getByTestId('ds-page-nav-menu-button'));
      await user.click(within(screen.getByTestId('ds-page-nav-menu')).getByRole('button', { name: 'Acceder' }));
      expect(ctaClickSpy).toHaveBeenCalledOnce();
    });
  });
});
