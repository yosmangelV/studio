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
Lista de filas con separadores. Cada ítem muestra un índice, un nombre y una descripción.

Por debajo de 768px el nombre va sobre la descripción. Desde 1024px el nombre se compone en grande a la
izquierda y la descripción ocupa una columna a la derecha, así cada fila llena el contenedor.
Las filas son contenido, no enlaces: no tienen estado hover ni flecha.

El diseño sigue el ancho de la lista (container queries), no el del viewport. La lista toma su ancho del
contenedor: dentro de un flex o grid, dale una celda con ancho.
        `,
      },
    },
  },
  render: (args) => ({
    props: { ...args, items: SAMPLE_ITEMS },
    template: `<ds-striped-list [items]="items" />`,
  }),
};

export default meta;
type Story = StoryObj<StripedListComponent>;

export const Default: Story = {};

export const Mobile: Story = {
  render: () => ({
    props: { items: SAMPLE_ITEMS },
    template: `<div style="max-width: 360px"><ds-striped-list [items]="items" /></div>`,
  }),
};
