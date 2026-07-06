import { render, screen } from '@testing-library/angular';
import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent', () => {
  it('renders the label', async () => {
    await render(FormFieldComponent, {
      componentInputs: { label: 'Correo electrónico', inputId: 'email' },
    });
    expect(screen.getByText('Correo electrónico')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor', async () => {
    await render(FormFieldComponent, {
      componentInputs: { label: 'Nombre', inputId: 'name' },
    });
    const label = screen.getByText('Nombre') as HTMLLabelElement;
    expect(label.htmlFor).toBe('name');
  });

  it('renders hint when provided and there is no error', async () => {
    await render(FormFieldComponent, {
      componentInputs: {
        label: 'Email',
        inputId: 'email',
        hint: 'Usa tu correo institucional',
        hasError: false,
      },
    });
    expect(screen.getByText('Usa tu correo institucional')).toBeInTheDocument();
  });

  it('renders error message when hasError is true', async () => {
    await render(FormFieldComponent, {
      componentInputs: {
        label: 'Email',
        inputId: 'email',
        hasError: true,
        errorMessage: 'Email inválido',
      },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Email inválido');
  });

  it('does not render hint when hasError is true', async () => {
    await render(FormFieldComponent, {
      componentInputs: {
        label: 'Email',
        inputId: 'email',
        hasError: true,
        errorMessage: 'Error',
        hint: 'Pista',
      },
    });
    expect(screen.queryByText('Pista')).not.toBeInTheDocument();
  });

  it('renders neither hint nor error when both are absent', async () => {
    const { container } = await render(FormFieldComponent, {
      componentInputs: { label: 'Campo', inputId: 'field' },
    });
    expect(container.querySelector('.form-field__error')).not.toBeInTheDocument();
    expect(container.querySelector('.form-field__hint')).not.toBeInTheDocument();
  });
});
