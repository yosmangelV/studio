import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { StudentLevel, StudentResponse } from '../../../../core/api/students.service';
import { StudentFormComponent, StudentFormPayload } from './student-form.component';

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
    expect(screen.getByRole('combobox', { name: 'Nivel' })).toBeInTheDocument();
    expect(screen.getByTestId('students-submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('students-cancel-button')).toBeInTheDocument();
  });

  it('shows the level prompt instead of an empty select on create', async () => {
    await render(StudentFormComponent, {
      componentInputs: { student: null },
    });
    expect(screen.getByRole('combobox', { name: 'Nivel' })).toHaveDisplayValue('Seleccionar nivel');
  });

  it('pre-populates fields when editing a student', async () => {
    await render(StudentFormComponent, {
      componentInputs: { student: mockStudent },
    });
    expect(screen.getByTestId('students-fullname-input')).toHaveValue('Juan Pérez');
    expect(screen.getByTestId('students-email-input')).toHaveValue('juan@test.com');
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
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Nivel' }), 'Principiante');
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

  it('shows permissions section on create, never admin', async () => {
    await render(StudentFormComponent, { componentInputs: { student: null } });
    expect(screen.getByTestId('perm-student')).toBeInTheDocument();
    expect(screen.getByTestId('perm-instructor')).toBeInTheDocument();
    expect(screen.queryByTestId('perm-admin')).not.toBeInTheDocument();
  });

  it('shows permissions section on edit, never admin', async () => {
    await render(StudentFormComponent, { componentInputs: { student: mockStudent } });
    expect(screen.getByTestId('perm-student')).toBeInTheDocument();
    expect(screen.getByTestId('perm-instructor')).toBeInTheDocument();
    expect(screen.queryByTestId('perm-admin')).not.toBeInTheDocument();
  });

  it('pre-checks estudiante permission on create', async () => {
    await render(StudentFormComponent, { componentInputs: { student: null } });
    expect(screen.getByTestId('perm-student')).toBeChecked();
  });

  it('populates student/instructor permissions from existing student on edit', async () => {
    const studentWithPerms: StudentResponse = { ...mockStudent, permissions: ['instructor'] };
    await render(StudentFormComponent, { componentInputs: { student: studentWithPerms } });
    expect(screen.getByTestId('perm-student')).not.toBeChecked();
    expect(screen.getByTestId('perm-instructor')).toBeChecked();
  });

  it('includes system_access with student permission in payload on create', async () => {
    const saveSpy = vi.fn();
    await render(StudentFormComponent, {
      componentInputs: { student: null },
      componentOutputs: { save: { emit: saveSpy } as unknown as never },
    });

    await userEvent.type(screen.getByTestId('students-fullname-input'), 'Roberto García');
    await userEvent.type(screen.getByTestId('students-email-input'), 'roberto@gym.com');
    fireEvent.input(screen.getByTestId('students-birthdate-input'), { target: { value: '1980-01-01' } });
    fireEvent.input(screen.getByTestId('students-enrollmentdate-input'), { target: { value: '2024-01-01' } });
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Nivel' }), 'Avanzado');
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));

    const payload: StudentFormPayload = saveSpy.mock.calls[0][0];
    expect(payload.system_access?.permissions).toContain('student');
    expect(payload.system_access?.permissions).not.toContain('admin');
  });
});
