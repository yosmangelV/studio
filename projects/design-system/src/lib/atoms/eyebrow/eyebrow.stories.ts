import type { Meta, StoryObj } from '@storybook/angular';
import { EyebrowComponent } from './eyebrow.component';

const meta: Meta<EyebrowComponent> = {
  title: 'Atoms/Eyebrow',
  component: EyebrowComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Decorative label placed above section headings to provide context and visual hierarchy.
Renders a short uppercase text with a leading accent line.

**Align:** \`start\` (default) for left-aligned sections, \`center\` for centered layouts.
        `,
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    align: {
      control: 'select',
      options: ['start', 'center'],
    },
  },
  render: (args) => ({
    props: args,
    template: `<ds-eyebrow [label]="label" [align]="align" />`,
  }),
};

export default meta;
type Story = StoryObj<EyebrowComponent>;

export const Default: Story = {
  args: { label: 'Nuestros servicios', align: 'start' },
};

export const Centered: Story = {
  args: { label: 'Estamos aquí', align: 'center' },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <ds-eyebrow label="Quiénes somos" align="start" />
        <ds-eyebrow label="Lo que ofrecemos" align="start" />
        <ds-eyebrow label="Estamos aquí" align="center" />
      </div>
    `,
  }),
};
