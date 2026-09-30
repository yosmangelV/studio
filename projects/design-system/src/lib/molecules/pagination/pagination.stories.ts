import type { Meta, StoryObj } from '@storybook/angular';
import { PaginationComponent } from './pagination.component';

const meta: Meta<PaginationComponent> = {
  title: 'Molecules/Pagination',
  component: PaginationComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pagination control for navigating multi-page datasets.

**Inputs:**
- \`currentPage\` (required) — the active page number (1-based)
- \`pages\` (required) — total number of pages
- \`total\` — total number of items (optional, not displayed by this component)

**Output:**
- \`pageChange\` — emits the requested page number when the user clicks a page or the prev/next arrows

**Ellipsis logic:** renders all page numbers when \`pages ≤ 7\`; collapses middle pages with \`…\` when there are more, always keeping first and last visible.

Renders nothing when \`pages ≤ 1\`.
        `,
      },
    },
  },
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 } },
    pages: { control: { type: 'number', min: 1 } },
    total: { control: { type: 'number', min: 0 } },
  },
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const FewPages: Story = {
  name: 'Few pages (≤ 7)',
  args: { currentPage: 1, pages: 5, total: 47 },
};

export const ManyPagesStart: Story = {
  name: 'Many pages — start',
  args: { currentPage: 1, pages: 12, total: 235 },
};

export const ManyPagesMiddle: Story = {
  name: 'Many pages — middle',
  args: { currentPage: 6, pages: 12, total: 235 },
};

export const ManyPagesEnd: Story = {
  name: 'Many pages — end',
  args: { currentPage: 12, pages: 12, total: 235 },
};

export const TwoPages: Story = {
  name: 'Two pages',
  args: { currentPage: 1, pages: 2, total: 25 },
};

export const SinglePage: Story = {
  name: 'Single page (hidden)',
  args: { currentPage: 1, pages: 1, total: 8 },
  parameters: {
    docs: {
      description: { story: 'Renders nothing when there is only one page.' },
    },
  },
};
