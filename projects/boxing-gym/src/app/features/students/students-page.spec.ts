import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { StudentLevel, StudentResponse } from '../../core/api/students.service';
import { StudentsService } from './data-access/students.service';
import StudentsPage from './students-page';

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

type MockService = {
  students: ReturnType<typeof signal<StudentResponse[]>>;
  loading: ReturnType<typeof signal<boolean>>;
  error: ReturnType<typeof signal<string | null>>;
  total: ReturnType<typeof signal<number>>;
  mutationSuccess: ReturnType<typeof signal<number>>;
  loadAll: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
};

function makeMockService(overrides: Partial<MockService> = {}): MockService {
  return {
    students: signal<StudentResponse[]>([]),
    loading: signal(false),
    error: signal<string | null>(null),
    total: signal(0),
    mutationSuccess: signal(0),
    loadAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    ...overrides,
  };
}

describe('StudentsPage', () => {
  it('renders the page container', async () => {
    const mockService = makeMockService();
    await render(StudentsPage, {
      providers: [{ provide: StudentsService, useValue: mockService }],
    });
    expect(screen.getByTestId('students-page')).toBeInTheDocument();
  });

  it('calls loadAll on init', async () => {
    const mockService = makeMockService();
    await render(StudentsPage, {
      providers: [{ provide: StudentsService, useValue: mockService }],
    });
    expect(mockService.loadAll).toHaveBeenCalledOnce();
  });

  it('renders the Nuevo alumno button in list mode', async () => {
    const mockService = makeMockService();
    await render(StudentsPage, {
      providers: [{ provide: StudentsService, useValue: mockService }],
    });
    expect(screen.getByTestId('students-create-button')).toBeInTheDocument();
  });

  it('shows the student list when students are loaded', async () => {
    const mockService = makeMockService({
      students: signal([mockStudent]),
    });
    await render(StudentsPage, {
      providers: [{ provide: StudentsService, useValue: mockService }],
    });
    expect(screen.getByTestId('students-list')).toBeInTheDocument();
    expect(screen.getByTestId('student-item-1')).toBeInTheDocument();
  });

  it('switches to create form when Nuevo alumno is clicked', async () => {
    const mockService = makeMockService();
    await render(StudentsPage, {
      providers: [{ provide: StudentsService, useValue: mockService }],
    });
    await userEvent.click(screen.getByTestId('students-create-button'));
    expect(screen.getByTestId('students-form')).toBeInTheDocument();
  });

  it('returns to list when cancel is clicked', async () => {
    const mockService = makeMockService();
    await render(StudentsPage, {
      providers: [{ provide: StudentsService, useValue: mockService }],
    });
    await userEvent.click(screen.getByTestId('students-create-button'));
    await userEvent.click(screen.getByTestId('students-cancel-button'));
    expect(screen.getByTestId('students-list')).toBeInTheDocument();
  });

  it('shows error message when service has an error', async () => {
    const mockService = makeMockService({
      error: signal('Error al cargar los alumnos.'),
    });
    await render(StudentsPage, {
      providers: [{ provide: StudentsService, useValue: mockService }],
    });
    expect(screen.getByText('Error al cargar los alumnos.')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    const mockService = makeMockService({
      loading: signal(true),
    });
    await render(StudentsPage, {
      providers: [{ provide: StudentsService, useValue: mockService }],
    });
    expect(screen.getByText('Cargando alumnos…')).toBeInTheDocument();
  });
});
