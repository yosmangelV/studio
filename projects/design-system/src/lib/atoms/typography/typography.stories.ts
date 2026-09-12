import type { Meta, StoryObj } from '@storybook/angular';
import { TypographyComponent } from './typography.component';

const meta: Meta<TypographyComponent> = {
  title: 'Atoms/Typography',
  component: TypographyComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Use \`ds-text\` instead of raw HTML heading and paragraph elements to keep font
sizes, weights, and line-heights consistent across the app.

**Variants:** \`display\` for hero headlines · \`h1\`–\`h6\` for section headings ·
\`body-lg\`, \`body\`, \`body-sm\` for body copy · \`label\` for form labels and tags ·
\`caption\` for helper text and timestamps.

**Semantic tag override:** Each variant maps to the right HTML element by default.
Use the \`as\` input when the visual style and document hierarchy need to differ —
for example, a section title that looks like \`h2\` but should be \`h3\` in the DOM.

**Dark mode:** All colors use CSS custom properties and update automatically.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['display', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body-lg', 'body', 'body-sm', 'label', 'caption'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'muted', 'link', 'error', 'success', 'inverse'],
    },
    truncate: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    template: `<ds-text [variant]="variant" [color]="color" [truncate]="truncate">The quick brown fox jumps over the lazy dog</ds-text>`,
  }),
};

export default meta;
type Story = StoryObj<TypographyComponent>;

export const Display: Story = {
  args: { variant: 'display', color: 'primary' },
};

export const H1: Story = {
  args: { variant: 'h1', color: 'primary' },
};

export const H2: Story = {
  args: { variant: 'h2', color: 'primary' },
};

export const H3: Story = {
  args: { variant: 'h3', color: 'primary' },
};

export const Body: Story = {
  args: { variant: 'body', color: 'primary' },
};

export const BodySmall: Story = {
  args: { variant: 'body-sm', color: 'secondary' },
};

export const Label: Story = {
  args: { variant: 'label', color: 'primary' },
};

export const Caption: Story = {
  args: { variant: 'caption', color: 'muted' },
};

export const Truncate: Story = {
  args: { variant: 'body', color: 'secondary', truncate: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 200px;">
        <ds-text [variant]="variant" [color]="color" [truncate]="truncate">
          This is a very long text that will be truncated when it overflows the container
        </ds-text>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: (_args) => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <ds-text variant="display">Display — The quick brown fox</ds-text>
        <ds-text variant="h1">Heading 1 — The quick brown fox</ds-text>
        <ds-text variant="h2">Heading 2 — The quick brown fox</ds-text>
        <ds-text variant="h3">Heading 3 — The quick brown fox</ds-text>
        <ds-text variant="h4">Heading 4 — The quick brown fox</ds-text>
        <ds-text variant="h5">Heading 5 — The quick brown fox</ds-text>
        <ds-text variant="h6">Heading 6 — The quick brown fox</ds-text>
        <hr style="border-color: var(--color-border);" />
        <ds-text variant="body-lg">Body Large — Lorem ipsum dolor sit amet, consectetur adipiscing elit.</ds-text>
        <ds-text variant="body">Body — Lorem ipsum dolor sit amet, consectetur adipiscing elit.</ds-text>
        <ds-text variant="body-sm">Body Small — Lorem ipsum dolor sit amet, consectetur adipiscing elit.</ds-text>
        <hr style="border-color: var(--color-border);" />
        <ds-text variant="label">Label text</ds-text>
        <ds-text variant="caption">Caption — Metadata and helper text</ds-text>
      </div>
    `,
  }),
};

export const AllColors: Story = {
  render: (_args) => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <ds-text variant="body" color="primary">Primary — Main content text</ds-text>
        <ds-text variant="body" color="secondary">Secondary — Supporting text</ds-text>
        <ds-text variant="body" color="muted">Muted — Tertiary / placeholder text</ds-text>
        <ds-text variant="body" color="link">Link — Clickable text color</ds-text>
        <ds-text variant="body" color="error">Error — Validation messages</ds-text>
        <ds-text variant="body" color="success">Success — Confirmation messages</ds-text>
      </div>
    `,
  }),
};
