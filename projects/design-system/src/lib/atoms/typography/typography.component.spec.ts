import { render, screen } from '@testing-library/angular';
import { TypographyComponent } from './typography.component';

describe('TypographyComponent', () => {
  it('renders projected content', async () => {
    await render(`<ds-text>Hello world</ds-text>`, { imports: [TypographyComponent] });
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders as <p> by default (body variant)', async () => {
    const { container } = await render(`<ds-text>Text</ds-text>`, { imports: [TypographyComponent] });
    expect(container.querySelector('p')).toBeInTheDocument();
  });

  it.each([
    ['h1', 'h1'],
    ['h2', 'h2'],
    ['h3', 'h3'],
    ['h4', 'h4'],
    ['h5', 'h5'],
    ['h6', 'h6'],
  ] as const)('renders as <%s> for variant %s', async (variant, tag) => {
    const { container } = await render(`<ds-text variant="${variant}">Heading</ds-text>`, { imports: [TypographyComponent] });
    expect(container.querySelector(tag)).toBeInTheDocument();
  });

  it('overrides tag via the "as" input', async () => {
    const { container } = await render(`<ds-text variant="h2" as="h3">Title</ds-text>`, { imports: [TypographyComponent] });
    expect(container.querySelector('h3')).toBeInTheDocument();
    expect(container.querySelector('h2')).not.toBeInTheDocument();
  });

  it('applies variant class', async () => {
    const { container } = await render(`<ds-text variant="body-lg">Text</ds-text>`, { imports: [TypographyComponent] });
    expect(container.querySelector('p')).toHaveClass('text--body-lg');
  });

  it('applies color class', async () => {
    const { container } = await render(`<ds-text color="secondary">Text</ds-text>`, { imports: [TypographyComponent] });
    expect(container.querySelector('p')).toHaveClass('text--secondary');
  });

  it('applies truncate class when truncate is true', async () => {
    const { container } = await render(`<ds-text [truncate]="true">Text</ds-text>`, { imports: [TypographyComponent] });
    expect(container.querySelector('p')).toHaveClass('text--truncate');
  });
});
