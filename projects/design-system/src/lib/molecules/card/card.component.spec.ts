import { render, screen } from '@testing-library/angular';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  it('renders projected content', async () => {
    await render(`<ds-card>Card content</ds-card>`, { imports: [CardComponent] });
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it.each([
    ['elevated', 'card--elevated'],
    ['outlined', 'card--outlined'],
    ['flat',     'card--flat'],
  ] as const)('applies %s variant class', async (variant, expectedClass) => {
    const { container } = await render(`<ds-card variant="${variant}">Content</ds-card>`, { imports: [CardComponent] });
    expect(container.querySelector('.card')).toHaveClass(expectedClass);
  });

  it.each([
    ['none', 'card--pad-none'],
    ['sm',   'card--pad-sm'],
    ['md',   'card--pad-md'],
    ['lg',   'card--pad-lg'],
  ] as const)('applies %s padding class', async (padding, expectedClass) => {
    const { container } = await render(`<ds-card padding="${padding}">Content</ds-card>`, { imports: [CardComponent] });
    expect(container.querySelector('.card')).toHaveClass(expectedClass);
  });

  it('applies interactive class when interactive is true', async () => {
    const { container } = await render(`<ds-card [interactive]="true">Content</ds-card>`, { imports: [CardComponent] });
    expect(container.querySelector('.card')).toHaveClass('card--interactive');
  });

  it('does not apply interactive class by default', async () => {
    const { container } = await render(`<ds-card>Content</ds-card>`, { imports: [CardComponent] });
    expect(container.querySelector('.card')).not.toHaveClass('card--interactive');
  });

  it('applies full-height class when fullHeight is true', async () => {
    const { container } = await render(`<ds-card [fullHeight]="true">Content</ds-card>`, { imports: [CardComponent] });
    expect(container.querySelector('.card')).toHaveClass('card--full-height');
  });
});
