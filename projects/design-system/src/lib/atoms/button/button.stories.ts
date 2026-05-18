import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Atoms/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    template: `
      <ds-button
        [variant]="variant"
        [size]="size"
        [disabled]="disabled"
        [loading]="loading"
        [fullWidth]="fullWidth"
      >Click me</ds-button>
    `,
  }),
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: { variant: 'primary', size: 'md' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', size: 'md' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', size: 'md' },
};

export const Danger: Story = {
  args: { variant: 'danger', size: 'md' },
};

export const Small: Story = {
  args: { variant: 'primary', size: 'sm' },
};

export const Large: Story = {
  args: { variant: 'primary', size: 'lg' },
};

export const Loading: Story = {
  args: { variant: 'primary', size: 'md', loading: true },
};

export const Disabled: Story = {
  args: { variant: 'primary', size: 'md', disabled: true },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <ds-button variant="primary">Primary</ds-button>
        <ds-button variant="secondary">Secondary</ds-button>
        <ds-button variant="ghost">Ghost</ds-button>
        <ds-button variant="danger">Danger</ds-button>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <ds-button variant="primary" size="sm">Small</ds-button>
        <ds-button variant="primary" size="md">Medium</ds-button>
        <ds-button variant="primary" size="lg">Large</ds-button>
      </div>
    `,
  }),
};
