import type { Meta, StoryObj } from '@storybook/angular';
import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Atoms/Badge',
  component: BadgeComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pill label for statuses, tags, and contextual indicators.

**Variants:** \`default\` for neutral labels, \`success\` for positive states,
\`warning\` for caution or "coming soon" indicators, \`danger\` for errors or destructive states.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger'],
    },
  },
  render: (args) => ({
    props: args,
    template: `<ds-badge [variant]="variant">Label</ds-badge>`,
  }),
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Default: Story = {
  args: { variant: 'default' },
};

export const Success: Story = {
  args: { variant: 'success' },
};

export const Warning: Story = {
  args: { variant: 'warning' },
};

export const Danger: Story = {
  args: { variant: 'danger' },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <ds-badge variant="default">Default</ds-badge>
        <ds-badge variant="success">Activo</ds-badge>
        <ds-badge variant="warning">Pronto</ds-badge>
        <ds-badge variant="danger">Inactivo</ds-badge>
      </div>
    `,
  }),
};
