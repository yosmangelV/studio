import type { Meta, StoryObj } from '@storybook/angular';
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
