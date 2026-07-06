import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  it('renders an input element', async () => {
    await render(InputComponent, {
      componentInputs: { placeholder: 'Escribe aquí' },
    });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with the correct type attribute', async () => {
    await render(InputComponent, {
      componentInputs: { type: 'email', placeholder: 'Email' },
    });
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('renders placeholder text', async () => {
    await render(InputComponent, {
      componentInputs: { placeholder: 'Escribe aquí' },
    });
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Escribe aquí');
  });

  it('applies error class when hasError is true', async () => {
    await render(InputComponent, {
      componentInputs: { hasError: true },
    });
    expect(screen.getByRole('textbox')).toHaveClass('input--invalid');
  });

  it('does not apply error class when hasError is false', async () => {
    await render(InputComponent, {
      componentInputs: { hasError: false },
    });
    expect(screen.getByRole('textbox')).not.toHaveClass('input--invalid');
  });

  it('is disabled when bound to a disabled FormControl', async () => {
    const control = new FormControl({ value: '', disabled: true });
    await render(
      `<ds-input [formControl]="control"></ds-input>`,
      { imports: [InputComponent, ReactiveFormsModule], componentProperties: { control } },
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('updates FormControl value as user types', async () => {
    const user = userEvent.setup();
    const control = new FormControl('');
    await render(
      `<ds-input [formControl]="control" placeholder="Nombre"></ds-input>`,
      { imports: [InputComponent, ReactiveFormsModule], componentProperties: { control } },
    );
    await user.type(screen.getByRole('textbox'), 'John');
    expect(control.value).toBe('John');
  });

  it('renders data-testid when testId input is set', async () => {
    await render(InputComponent, {
      componentInputs: { testId: 'login-email' },
    });
    expect(screen.getByTestId('login-email')).toBeInTheDocument();
  });
});
