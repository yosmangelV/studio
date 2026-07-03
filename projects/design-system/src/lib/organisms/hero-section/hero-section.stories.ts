import type { Meta, StoryObj } from '@storybook/angular';
import { HeroSectionComponent } from './hero-section.component';

const meta: Meta<HeroSectionComponent> = {
  title: 'Organisms/HeroSection',
  component: HeroSectionComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Sección hero de pantalla completa con fondo decorativo (spotlight + grid), headline en dos líneas,
tagline y dos CTAs.

**Headline:** el consumidor decide cómo dividir el nombre en \`headlineTop\` (ligero, muted) y
\`headlineMain\` (bold, gigante). El DS no asume ninguna lógica de splitting.

**Watermark:** imagen opcional que se renderiza como fondo semi-transparente en la esquina inferior derecha.

**Tokens:** \`--color-surface\` controla el fondo; \`--color-grid-line\` el overlay de cuadrícula.
Ambos se sobreescriben por app vía el token bridge.
        `,
      },
    },
  },
  argTypes: {
    eyebrow:           { control: 'text' },
    headlineTop:       { control: 'text' },
    headlineMain:      { control: 'text' },
    tagline:           { control: 'text' },
    primaryCtaLabel:   { control: 'text' },
    primaryCtaHref:    { control: 'text' },
    secondaryCtaLabel: { control: 'text' },
    secondaryCtaHref:  { control: 'text' },
    logoSrc:           { control: 'text' },
  },
  render: (args) => ({
    props: args,
    template: `
      <ds-hero-section
        [eyebrow]="eyebrow"
        [headlineTop]="headlineTop"
        [headlineMain]="headlineMain"
        [tagline]="tagline"
        [primaryCtaLabel]="primaryCtaLabel"
        [primaryCtaHref]="primaryCtaHref"
        [secondaryCtaLabel]="secondaryCtaLabel"
        [secondaryCtaHref]="secondaryCtaHref"
        [logoSrc]="logoSrc"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<HeroSectionComponent>;

export const Default: Story = {
  args: {
    eyebrow:           'Bienvenido',
    headlineTop:       'LEGION',
    headlineMain:      'BOXING',
    tagline:           'Entrenamiento de alto rendimiento para todos los niveles. Técnica, disciplina y comunidad.',
    primaryCtaLabel:   'Ver clases',
    primaryCtaHref:    '#classes',
    secondaryCtaLabel: 'Contáctanos',
    secondaryCtaHref:  '#contact',
    logoSrc:           '',
  },
};

export const WithWatermark: Story = {
  args: {
    ...Default.args,
    logoSrc: '/assets/logo.svg',
  },
};
