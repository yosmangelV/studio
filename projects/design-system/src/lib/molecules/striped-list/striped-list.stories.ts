import type { Meta, StoryObj } from '@storybook/angular';
import { StripedListComponent } from './striped-list.component';

const SAMPLE_ITEMS = [
  { index: '01', name: 'Boxeo Técnico', description: 'Fundamentos, guardia, jab, cross, hooks y uppercuts con énfasis en técnica.' },
  { index: '02', name: 'Sparring Controlado', description: 'Sesiones de práctica supervisadas para aplicar técnica en condiciones reales.' },
  { index: '03', name: 'Acondicionamiento', description: 'Fuerza, resistencia y agilidad específica para el deporte de contacto.' },
  { index: '04', name: 'Cardio Boxing', description: 'Rutinas de alta intensidad basadas en movimientos de boxeo sin contacto.' },
];

const meta: Meta<StripedListComponent> = {
  title: 'Molecules/StripedList',
  component: StripedListComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Lista con borde exterior y separadores de fila. Cada ítem muestra un índice numérico, nombre y descripción.
En desktop incluye un área de flecha con animación de hover.

**showArrow:** controla si se renderiza el indicador \`→\` al final de cada fila.
        `,
      },
    },
  },
  argTypes: {
    showArrow: { control: 'boolean' },
  },
  render: (args) => ({
    props: { ...args, items: SAMPLE_ITEMS },
    template: `<ds-striped-list [items]="items" [showArrow]="showArrow" />`,
  }),
};

export default meta;
type Story = StoryObj<StripedListComponent>;

export const Default: Story = {
  args: { showArrow: true },
};

export const WithoutArrow: Story = {
  args: { showArrow: false },
};

export const AllVariants: Story = {
  render: () => ({
    props: { items: SAMPLE_ITEMS },
    template: `
      <div style="display: flex; flex-direction: column; gap: 3rem;">
        <div>
          <p style="margin-bottom: 1rem; font-size: 0.75rem; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.1em;">Con flecha</p>
          <ds-striped-list [items]="items" [showArrow]="true" />
        </div>
        <div>
          <p style="margin-bottom: 1rem; font-size: 0.75rem; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.1em;">Sin flecha</p>
          <ds-striped-list [items]="items" [showArrow]="false" />
        </div>
      </div>
    `,
  }),
};
