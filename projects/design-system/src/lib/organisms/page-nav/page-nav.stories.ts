import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { PageNavComponent } from './page-nav.component';

const SAMPLE_LINKS = [
  { label: 'Nosotros', href: '#about' },
  { label: 'Clases', href: '#classes' },
  { label: 'Horarios', href: '#schedule' },
  { label: 'Contacto', href: '#contact' },
];

const meta: Meta<PageNavComponent> = {
  title: 'Organisms/PageNav',
  component: PageNavComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Nav fija con logo, links de sección y un CTA. Se posiciona en \`fixed top-0\` con fondo frosted.

**Links:** anclas a secciones de la misma página (\`href="#section"\`).

**CTA:** emite \`ctaClick\` — el consumer decide cómo navegar (router, href externo, modal, etc.).

**Por debajo de 768px:** los links y el CTA pasan a \`ds-page-nav-menu\`, un menú desplegable (patrón *disclosure* de WAI-ARIA).
El botón lleva \`aria-expanded\` y \`aria-controls\`; Escape, un link, el CTA o un clic fuera lo cierran, y
Escape devuelve el foco al botón. \`menuLabel\` da el nombre accesible del botón (por defecto «Menú»).

**Token \`--color-surface-nav\`:** controla el fondo del gradiente. Cada app lo sobreescribe vía su token bridge.
        `,
      },
    },
  },
  argTypes: {
    brandName:     { control: 'text' },
    brandSubtitle: { control: 'text' },
    brandHref:     { control: 'text' },
    ctaLabel:      { control: 'text' },
    menuLabel:     { control: 'text' },
    ctaClick:      { action: 'ctaClick' },
  },
  render: (args) => ({
    props: { ...args, links: SAMPLE_LINKS },
    template: `
      <ds-page-nav
        [brandName]="brandName"
        [brandSubtitle]="brandSubtitle"
        [brandHref]="brandHref"
        [links]="links"
        [ctaLabel]="ctaLabel"
        (ctaClick)="ctaClick()"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<PageNavComponent>;

export const Default: Story = {
  args: {
    brandName: 'LEGION BOXING',
    brandSubtitle: 'GYM & FITNESS',
    brandHref: '#hero',
    ctaLabel: 'Acceder',
  },
};

export const CustomCta: Story = {
  args: {
    brandName: 'LEGION BOXING',
    brandSubtitle: 'GYM & FITNESS',
    brandHref: '#hero',
    ctaLabel: 'Únete',
  },
};

export const Mobile: Story = {
  args: { ...Default.args },
  globals: { viewport: { value: 'mobile1' } },
};

export const MobileMenuOpen: Story = {
  args: { ...Default.args },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Menú' });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('link', { name: 'Clases' })).toBeVisible();
  },
};
