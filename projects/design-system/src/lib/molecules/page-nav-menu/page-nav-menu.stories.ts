import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { PageNavMenuComponent } from './page-nav-menu.component';

const SAMPLE_LINKS = [
  { label: 'Nosotros', href: '#about' },
  { label: 'Clases', href: '#classes' },
  { label: 'Horarios', href: '#schedule' },
  { label: 'Contacto', href: '#contact' },
];

const meta: Meta<PageNavMenuComponent> = {
  title: 'Molecules/PageNavMenu',
  component: PageNavMenuComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Menú de \`ds-page-nav\` para pantallas estrechas (patrón *disclosure* de WAI-ARIA). Se oculta desde 768px,
donde la nav muestra los links en la barra.

El botón lleva \`aria-expanded\` y \`aria-controls\`. Escape, un link, el CTA o un clic fuera cierran el panel,
y Escape devuelve el foco al botón. El panel se posiciona en absoluto: colócalo dentro de una barra
posicionada, como hace \`ds-page-nav\`, para que cuelgue debajo a todo el ancho.
        `,
      },
    },
  },
  globals: { viewport: { value: 'mobile1' } },
  argTypes: {
    ctaLabel:  { control: 'text' },
    menuLabel: { control: 'text' },
    ctaClick:  { action: 'ctaClick' },
  },
  render: (args) => ({
    props: { ...args, links: SAMPLE_LINKS },
    template: `
      <div style="position: relative; display: flex; justify-content: flex-end; padding: 1rem;">
        <ds-page-nav-menu [links]="links" [ctaLabel]="ctaLabel" [menuLabel]="menuLabel" (ctaClick)="ctaClick()" />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<PageNavMenuComponent>;

export const Closed: Story = {
  args: { ctaLabel: 'Acceder', menuLabel: 'Menú' },
};

export const Open: Story = {
  args: { ctaLabel: 'Acceder', menuLabel: 'Menú' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Menú' });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('link', { name: 'Clases' })).toBeVisible();
  },
};
