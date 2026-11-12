import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { PageNavMenuComponent } from './page-nav-menu.component';

const LINKS = [
  { label: 'Nosotros', href: '#about' },
  { label: 'Clases',   href: '#classes' },
  { label: 'Contacto', href: '#contact' },
];

const menuButton = () => screen.getByTestId('ds-page-nav-menu-button');
const menuPanel = () => screen.getByTestId('ds-page-nav-menu');

describe('PageNavMenuComponent', () => {
  it('starts closed, with the button controlling the panel', async () => {
    await render(PageNavMenuComponent, { componentInputs: { links: LINKS } });
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton()).toHaveAccessibleName('Menú');
    expect(menuButton()).toHaveAttribute('aria-controls', menuPanel().id);
    expect(menuPanel()).not.toBeVisible();
  });

  it('opens on click and lists every link and the CTA', async () => {
    const user = userEvent.setup();
    await render(PageNavMenuComponent, { componentInputs: { links: LINKS } });
    await user.click(menuButton());
    expect(menuButton()).toHaveAttribute('aria-expanded', 'true');
    expect(menuPanel()).toBeVisible();
    const panel = within(menuPanel());
    expect(panel.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['#about', '#classes', '#contact']);
    expect(panel.getByRole('button', { name: 'Acceder' })).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the button', async () => {
    const user = userEvent.setup();
    await render(PageNavMenuComponent, { componentInputs: { links: LINKS } });
    await user.click(menuButton());
    await user.tab();
    expect(within(menuPanel()).getByRole('link', { name: 'Nosotros' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton()).toHaveFocus();
  });

  it('ignores Escape while closed', async () => {
    const user = userEvent.setup();
    await render(`<button>Antes</button><ds-page-nav-menu [links]="links" />`, {
      imports: [PageNavMenuComponent],
      componentProperties: { links: LINKS },
    });
    await user.click(screen.getByRole('button', { name: 'Antes' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Antes' })).toHaveFocus();
  });

  it('closes when focus moves past the menu, so the panel cannot cover it', async () => {
    const user = userEvent.setup();
    await render(`<ds-page-nav-menu [links]="links" /><button>Después</button>`, {
      imports: [PageNavMenuComponent],
      componentProperties: { links: LINKS },
    });
    await user.click(menuButton());
    await user.tab(); // Nosotros
    await user.tab(); // Clases
    await user.tab(); // Contacto
    await user.tab(); // CTA
    expect(menuButton()).toHaveAttribute('aria-expanded', 'true');
    await user.tab(); // leaves the menu
    expect(screen.getByRole('button', { name: 'Después' })).toHaveFocus();
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when a link is chosen', async () => {
    const user = userEvent.setup();
    await render(PageNavMenuComponent, { componentInputs: { links: LINKS } });
    await user.click(menuButton());
    await user.click(within(menuPanel()).getByRole('link', { name: 'Clases' }));
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on a click outside', async () => {
    const user = userEvent.setup();
    await render(`<ds-page-nav-menu [links]="links" /><p>Página</p>`, {
      imports: [PageNavMenuComponent],
      componentProperties: { links: LINKS },
    });
    await user.click(menuButton());
    await user.click(screen.getByText('Página'));
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
  });

  it('emits ctaClick and closes when the CTA is chosen', async () => {
    const user = userEvent.setup();
    const ctaClickSpy = vi.fn();
    await render(PageNavMenuComponent, {
      componentInputs: { links: LINKS, ctaLabel: 'Sign in', menuLabel: 'Menu' },
      on: { ctaClick: ctaClickSpy },
    });
    expect(menuButton()).toHaveAccessibleName('Menu');
    await user.click(menuButton());
    await user.click(within(menuPanel()).getByRole('button', { name: 'Sign in' }));
    expect(ctaClickSpy).toHaveBeenCalledOnce();
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
  });

  it('gives each instance its own panel id', async () => {
    await render(`<ds-page-nav-menu [links]="links" /><ds-page-nav-menu [links]="links" />`, {
      imports: [PageNavMenuComponent],
      componentProperties: { links: LINKS },
    });
    const ids = screen.getAllByTestId('ds-page-nav-menu').map((panel) => panel.id);
    expect(new Set(ids).size).toBe(2);
  });
});
