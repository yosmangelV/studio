import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { StudentLevel, StudentResponse } from '../../../../core/api/students.service';
import { StudentFormComponent } from './student-form.component';

const mockStudent: StudentResponse = {
  id: '1',
  full_name: 'Juan Pérez',
  email: 'juan@test.com',
  phone: '+34600000000',
  level: StudentLevel.intermediate,
  is_active: true,
  birth_date: '1990-05-15',
  enrollment_date: '2024-01-15',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('StudentFormComponent', () => {
  it('renders the form', async () => {
    await render(StudentFormComponent, {
      componentInputs: { student: null },
    });
    expect(screen.getByTestId('students-form')).toBeInTheDocument();
  });

  it('renders all main form fields', async () => {
    await render(StudentFormComponent, {
      componentInputs: { student: null },
    });
    expect(screen.getByTestId('students-fullname-input')).toBeInTheDocument();
    expect(screen.getByTestId('students-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('students-phone-input')).toBeInTheDocument();
    expect(screen.getByTestId('students-birthdate-input')).toBeInTheDocument();
    expect(screen.getByTestId('students-enrollmentdate-input')).toBeInTheDocument();
    expect(screen.getByTestId('students-level-select')).toBeInTheDocument();
    expect(screen.getByTestId('students-submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('students-cancel-button')).toBeInTheDocument();
  });

  it('pre-populates fields when editing a student', async () => {
    await render(StudentFormComponent, {
      componentInputs: { student: mockStudent },
    });
    const nameInput = screen.getByTestId('students-fullname-input') as HTMLInputElement;
    const emailInput = screen.getByTestId('students-email-input') as HTMLInputElement;
    expect(nameInput.value).toBe('Juan Pérez');
    expect(emailInput.value).toBe('juan@test.com');
  });

  it('emits cancel when cancel button is clicked', async () => {
    const cancelSpy = vi.fn();
    await render(StudentFormComponent, {
      componentInputs: { student: null },
      componentOutputs: { cancel: { emit: cancelSpy } as unknown as never },
    });
    await userEvent.click(screen.getByTestId('students-cancel-button'));
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('does not emit save when form is invalid', async () => {
    const saveSpy = vi.fn();
    await render(StudentFormComponent, {
      componentInputs: { student: null },
      componentOutputs: { save: { emit: saveSpy } as unknown as never },
    });
    await userEvent.click(screen.getByTestId('students-submit-button'));
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('emits save with correct payload on valid submit', async () => {
    const saveSpy = vi.fn();
    await render(StudentFormComponent, {
      componentInputs: { student: null },
      componentOutputs: { save: { emit: saveSpy } as unknown as never },
    });

    await userEvent.type(screen.getByTestId('students-fullname-input'), 'Ana López');
    await userEvent.type(screen.getByTestId('students-email-input'), 'ana@test.com');
    fireEvent.input(screen.getByTestId('students-birthdate-input'), { target: { value: '1995-03-20' } });
    fireEvent.input(screen.getByTestId('students-enrollmentdate-input'), { target: { value: '2024-06-01' } });
    await userEvent.selectOptions(screen.getByTestId('students-level-select'), 'beginner');
    // Use getByRole to target the inner <button> element, not the ds-button host
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: 'Ana López',
        email: 'ana@test.com',
        level: 'beginner',
      })
    );
  });
});
