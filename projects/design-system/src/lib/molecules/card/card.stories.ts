import type { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './card.component';

const meta: Meta<CardComponent> = {
  title: 'Molecules/Card',
  component: CardComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A flexible container that groups related content.

**Variants:** \`elevated\` (default) uses a subtle shadow, \`outlined\` uses a border, \`flat\` has no decoration.

**Slots:**
- \`[card-header]\` — projected above the body, renders flush to the edges (ideal for images)
- Default slot — wrapped in \`.card__body\` with configurable padding
- \`[card-footer]\` — projected below the body

**Interactive mode:** Adds hover lift animation and pointer cursor for clickable cards.
        `,
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['elevated', 'outlined', 'flat'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    interactive: { control: 'boolean' },
    fullHeight: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 360px;">
        <ds-card [variant]="variant" [padding]="padding" [interactive]="interactive">
          <p style="margin: 0; color: var(--color-text-primary);">Card body content goes here.</p>
        </ds-card>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Elevated: Story = {
  args: { variant: 'elevated', padding: 'md' },
};

export const Outlined: Story = {
  args: { variant: 'outlined', padding: 'md' },
};

export const Flat: Story = {
  args: { variant: 'flat', padding: 'md' },
};

export const Interactive: Story = {
  args: { variant: 'elevated', padding: 'md', interactive: true },
};

export const WithHeader: Story = {
  render: () => ({
    template: `
      <div style="max-width: 360px;">
        <ds-card variant="elevated">
          <div card-header>
            <img
              src="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=720&q=80"
              alt="Sample"
              style="width: 100%; height: 200px; object-fit: cover; display: block;"
            />
          </div>
          <p style="margin: 0; color: var(--color-text-primary); font-size: var(--text-sm);">
            A card with a header image and body text.
          </p>
        </ds-card>
      </div>
    `,
  }),
};

export const WithFooter: Story = {
  render: () => ({
    template: `
      <div style="max-width: 360px;">
        <ds-card variant="outlined">
          <p style="margin: 0; color: var(--color-text-primary);">
            Card body with a footer action.
          </p>
          <div card-footer style="padding: var(--space-4) var(--space-6); border-top: 1px solid var(--color-border);">
            <span style="font-size: var(--text-sm); color: var(--color-text-secondary);">Footer content</span>
          </div>
        </ds-card>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <div style="width: 200px;">
          <ds-card variant="elevated" padding="md">
            <p style="margin: 0; color: var(--color-text-secondary); font-size: var(--text-sm);">Elevated</p>
          </ds-card>
        </div>
        <div style="width: 200px;">
          <ds-card variant="outlined" padding="md">
            <p style="margin: 0; color: var(--color-text-secondary); font-size: var(--text-sm);">Outlined</p>
          </ds-card>
        </div>
        <div style="width: 200px;">
          <ds-card variant="flat" padding="md">
            <p style="margin: 0; color: var(--color-text-secondary); font-size: var(--text-sm);">Flat</p>
          </ds-card>
        </div>
      </div>
    `,
  }),
};
