import { render, screen } from '@testing-library/angular';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  it('renders projected content', async () => {
    await render(`<ds-badge>Pronto</ds-badge>`, { imports: [BadgeComponent] });
    expect(screen.getByText('Pronto')).toBeInTheDocument();
  });

  it('applies default variant class when no variant is provided', async () => {
    await render(`<ds-badge>Label</ds-badge>`, { imports: [BadgeComponent] });
    const host = screen.getByText('Label').closest('ds-badge');
    expect(host).toHaveClass('badge--default');
  });

  it.each([
    ['success', 'badge--success'],
    ['warning', 'badge--warning'],
    ['danger',  'badge--danger'],
  ] as const)('applies %s variant class', async (variant, expectedClass) => {
    await render(`<ds-badge variant="${variant}">Label</ds-badge>`, { imports: [BadgeComponent] });
    const host = screen.getByText('Label').closest('ds-badge');
    expect(host).toHaveClass(expectedClass);
  });
});
