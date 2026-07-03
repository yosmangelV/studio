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
Combines an \`Eyebrow\` label with a heading that supports an accent-colored word.
Used to open content sections across the app.

**Align:** \`start\` (default) for left-aligned sections, \`center\` for centered layouts.

**Level:** controls the semantic heading tag (\`h1\`, \`h2\`, \`h3\`). Default is \`h2\`.

**TitleAccent:** optional word rendered in primary color after the main title text.
        `,
      },
    },
  },
  argTypes: {
    eyebrow: { control: 'text' },
    title: { control: 'text' },
    titleAccent: { control: 'text' },
    align: { control: 'select', options: ['start', 'center'] },
    level: { control: 'select', options: ['h1', 'h2', 'h3'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <ds-section-header
        [eyebrow]="eyebrow"
        [title]="title"
        [titleAccent]="titleAccent"
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
    eyebrow: 'Quiénes somos',
    title: 'Sobre',
    titleAccent: 'Nosotros',
    align: 'start',
    level: 'h2',
  },
};

export const Centered: Story = {
  args: {
    eyebrow: 'Estamos aquí',
    title: 'Contáctanos',
    titleAccent: '',
    align: 'center',
    level: 'h2',
  },
};

export const NoAccent: Story = {
  args: {
    eyebrow: 'Lo que ofrecemos',
    title: 'Nuestras Clases',
    titleAccent: '',
    align: 'start',
    level: 'h2',
  },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 3rem;">
        <ds-section-header eyebrow="Quiénes somos" title="Sobre" titleAccent="Nosotros" align="start" level="h2" />
        <ds-section-header eyebrow="Lo que ofrecemos" title="Nuestras" titleAccent="Clases" align="start" level="h2" />
        <ds-section-header eyebrow="Estamos aquí" title="Contáctanos" align="center" level="h2" />
      </div>
    `,
  }),
};
