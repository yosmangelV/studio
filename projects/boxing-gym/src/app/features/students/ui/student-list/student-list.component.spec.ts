import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { StudentLevel, StudentResponse } from '../../../../core/api/students.service';
import { StudentListComponent } from './student-list.component';

const mockStudent: StudentResponse = {
  id: '1',
  full_name: 'Juan Pérez',
  email: 'juan@test.com',
  level: StudentLevel.beginner,
  is_active: true,
  birth_date: '1990-01-01',
  enrollment_date: '2024-01-01',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const inactiveStudent: StudentResponse = {
  ...mockStudent,
  id: '2',
  full_name: 'María García',
  is_active: false,
  level: StudentLevel.advanced,
};

describe('StudentListComponent', () => {
  it('renders the list container', async () => {
    await render(StudentListComponent, {
      componentInputs: { students: [] },
    });
    expect(screen.getByTestId('students-list')).toBeInTheDocument();
  });

  it('shows empty state when no students', async () => {
    await render(StudentListComponent, {
      componentInputs: { students: [] },
    });
    expect(screen.getByTestId('students-empty')).toBeInTheDocument();
    expect(screen.getByText('No hay alumnos registrados.')).toBeInTheDocument();
  });

  it('renders a row for each student', async () => {
    await render(StudentListComponent, {
      componentInputs: { students: [mockStudent, inactiveStudent] },
    });
    expect(screen.getByTestId('student-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('student-item-2')).toBeInTheDocument();
  });

  it('displays student name and email', async () => {
    await render(StudentListComponent, {
      componentInputs: { students: [mockStudent] },
    });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan@test.com')).toBeInTheDocument();
  });

  it('shows level badge label', async () => {
    await render(StudentListComponent, {
      componentInputs: { students: [mockStudent] },
    });
    expect(screen.getByText('Principiante')).toBeInTheDocument();
  });

  it('shows Activo for active students', async () => {
    await render(StudentListComponent, {
      componentInputs: { students: [mockStudent] },
    });
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('shows Inactivo for inactive students', async () => {
    await render(StudentListComponent, {
      componentInputs: { students: [inactiveStudent] },
    });
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('emits edit output when edit button is clicked', async () => {
    const editSpy = vi.fn();
    await render(StudentListComponent, {
      componentInputs: { students: [mockStudent] },
      componentOutputs: { edit: { emit: editSpy } as unknown as never },
    });
    await userEvent.click(screen.getByTestId('students-edit-button-1'));
    expect(editSpy).toHaveBeenCalledWith(mockStudent);
  });

  it('emits deletedStudent output when delete button is clicked', async () => {
    const deleteSpy = vi.fn();
    await render(StudentListComponent, {
      componentInputs: { students: [mockStudent] },
      componentOutputs: { deletedStudent: { emit: deleteSpy } as unknown as never },
    });
    await userEvent.click(screen.getByTestId('students-delete-button-1'));
    expect(deleteSpy).toHaveBeenCalledWith('1');
  });
});
