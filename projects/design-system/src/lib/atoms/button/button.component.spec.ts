import { render, screen } from '@testing-library/angular';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  it('renders slotted label text', async () => {
    await render(`<ds-button>Guardar</ds-button>`, { imports: [ButtonComponent] });
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it.each([
    ['primary',   'btn--primary'],
    ['secondary', 'btn--secondary'],
    ['ghost',     'btn--ghost'],
    ['danger',    'btn--danger'],
    ['subtle',    'btn--subtle'],
  ] as const)('applies %s variant class', async (variant, expectedClass) => {
    await render(`<ds-button variant="${variant}">Action</ds-button>`, { imports: [ButtonComponent] });
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  it.each([
    ['sm', 'btn--sm'],
    ['md', 'btn--md'],
    ['lg', 'btn--lg'],
  ] as const)('applies %s size class', async (size, expectedClass) => {
    await render(`<ds-button size="${size}">Action</ds-button>`, { imports: [ButtonComponent] });
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  it('is disabled when disabled input is true', async () => {
    await render(`<ds-button [disabled]="true">Action</ds-button>`, { imports: [ButtonComponent] });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled during loading', async () => {
    await render(`<ds-button [loading]="true">Action</ds-button>`, { imports: [ButtonComponent] });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies w-full class when fullWidth is true', async () => {
    await render(`<ds-button [fullWidth]="true">Action</ds-button>`, { imports: [ButtonComponent] });
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });
});
