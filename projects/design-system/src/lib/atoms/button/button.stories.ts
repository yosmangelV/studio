import type { Meta, StoryObj } from '@storybook/angular';
import { Plus, ArrowRight, Search, X, Loader } from 'lucide-angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Atoms/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The primary interactive element of the design system.

**Variants:** \`primary\` for the main call to action (use once per section),
\`secondary\` for supporting actions, \`ghost\` for low-emphasis actions, and
\`danger\` for destructive operations.

**Icons:** Pass a Lucide icon to \`iconLeft\` or \`iconRight\`. Use \`iconOnly\` together with
a single icon and an \`aria-label\` for icon-only buttons (close, add, search…).

**Loading state:** Set \`loading\` to block interaction while an async operation runs.
The button keeps its size so the layout does not shift.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'subtle'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    iconOnly: { control: 'boolean' },
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
        [iconOnly]="iconOnly"
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

export const Subtle: Story = {
  args: { variant: 'subtle', size: 'md' },
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

export const WithIconLeft: Story = {
  render: (_args) => ({
    props: { PlusIcon: Plus },
    template: `<ds-button [iconLeft]="PlusIcon">Add Item</ds-button>`,
  }),
};

export const WithIconRight: Story = {
  render: (_args) => ({
    props: { ArrowRightIcon: ArrowRight },
    template: `<ds-button [iconRight]="ArrowRightIcon">Continue</ds-button>`,
  }),
};

export const WithBothIcons: Story = {
  render: (_args) => ({
    props: { SearchIcon: Search, ArrowRightIcon: ArrowRight },
    template: `<ds-button [iconLeft]="SearchIcon" [iconRight]="ArrowRightIcon">Search</ds-button>`,
  }),
};

export const IconOnly: Story = {
  render: (_args) => ({
    props: { XIcon: X },
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <ds-button [iconLeft]="XIcon" [iconOnly]="true" size="sm" variant="ghost" aria-label="Close"></ds-button>
        <ds-button [iconLeft]="XIcon" [iconOnly]="true" size="md" variant="secondary" aria-label="Close"></ds-button>
        <ds-button [iconLeft]="XIcon" [iconOnly]="true" size="lg" variant="primary" aria-label="Close"></ds-button>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: (_args) => ({
    template: `
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <ds-button variant="primary">Primary</ds-button>
        <ds-button variant="secondary">Secondary</ds-button>
        <ds-button variant="ghost">Ghost</ds-button>
        <ds-button variant="danger">Danger</ds-button>
        <ds-button variant="subtle">Subtle</ds-button>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: (_args) => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <ds-button variant="primary" size="sm">Small</ds-button>
        <ds-button variant="primary" size="md">Medium</ds-button>
        <ds-button variant="primary" size="lg">Large</ds-button>
      </div>
    `,
  }),
};

export const IconVariants: Story = {
  render: (_args) => ({
    props: { PlusIcon: Plus, SearchIcon: Search, XIcon: X, LoaderIcon: Loader },
    template: `
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <ds-button [iconLeft]="PlusIcon">Add Item</ds-button>
        <ds-button variant="secondary" [iconLeft]="SearchIcon">Search</ds-button>
        <ds-button variant="ghost" [iconLeft]="PlusIcon" [iconOnly]="true" aria-label="Add"></ds-button>
        <ds-button variant="secondary" [iconLeft]="XIcon" [iconOnly]="true" aria-label="Close"></ds-button>
        <ds-button variant="danger" [iconLeft]="XIcon" [iconOnly]="true" aria-label="Delete"></ds-button>
      </div>
    `,
  }),
};
