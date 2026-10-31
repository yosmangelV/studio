import type { Meta, StoryObj } from '@storybook/angular';
import { SectionHeaderComponent } from './section-header.component';

const meta: Meta<SectionHeaderComponent> = {
  title: 'Molecules/SectionHeader',
  component: SectionHeaderComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A one-colour section heading. Used to open content sections across the app.

**Align:** \`start\` (default) for left-aligned sections, \`center\` for centered layouts.

**Level:** controls the semantic heading tag (\`h1\`, \`h2\`, \`h3\`). Default is \`h2\`.

No eyebrow label and no accent-coloured word: see \`design.md\` → Anti-generated rules.
        `,
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    align: { control: 'select', options: ['start', 'center'] },
    level: { control: 'select', options: ['h1', 'h2', 'h3'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <ds-section-header
        [title]="title"
        [align]="align"
        [level]="level"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<SectionHeaderComponent>;

export const Default: Story = {
  args: {
    title: 'Sobre nosotros',
    align: 'start',
    level: 'h2',
  },
};

export const Centered: Story = {
  args: {
    title: 'Contáctanos',
    align: 'center',
    level: 'h2',
  },
};

export const AllVariants: Story = {
  render: (_args) => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 3rem;">
        <ds-section-header title="Sobre nosotros" align="start" level="h2" />
        <ds-section-header title="Nuestras clases" align="start" level="h2" />
        <ds-section-header title="Contáctanos" align="center" level="h2" />
      </div>
    `,
  }),
};
