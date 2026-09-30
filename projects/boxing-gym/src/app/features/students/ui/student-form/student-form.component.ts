import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, FormFieldComponent, InputComponent } from 'design-system';
import {
  StudentCreate,
  StudentLevel,
  StudentResponse,
} from '../../../../core/api/students.service';

export type StudentFormPayload = StudentCreate;

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, InputComponent, ButtonComponent],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly student = input<StudentResponse | null>(null);
  readonly isCreating = computed(() => this.student() === null);

  readonly save = output<StudentFormPayload>();
  readonly cancel = output<void>();

  readonly levels: StudentLevel[] = ['beginner', 'intermediate', 'advanced'];
  readonly levelLabels: Record<StudentLevel, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  readonly form = this.fb.group({
    full_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.maxLength(20), Validators.pattern(/^\+?[0-9\s]*$/)]],
    birth_date: ['', Validators.required],
    enrollment_date: ['', Validators.required],
    level: ['' as StudentLevel, Validators.required],
    is_active: [true],
    weight: [null as number | null, Validators.min(0.01)],
    permissions: this.fb.group({
      student: [false],
      instructor: [false],
      admin: [false],
    }),
  });

  constructor() {
    effect(() => {
      const s = this.student();
      if (s) {
        this.form.patchValue({
          full_name: s.full_name,
          email: s.email,
          phone: s.phone ?? '',
          birth_date: s.birth_date,
          enrollment_date: s.enrollment_date,
          level: s.level,
          is_active: s.is_active ?? true,
          weight: s.weight ?? null,
          permissions: {
            student: s.permissions?.includes('student') ?? false,
            instructor: s.permissions?.includes('instructor') ?? false,
            admin: s.permissions?.includes('admin') ?? false,
          },
        });
      } else {
        this.form.reset({ is_active: true, permissions: { student: true, instructor: false, admin: false } });
      }
    });
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const payload: StudentFormPayload = {
      full_name: raw.full_name!,
      email: raw.email!,
      birth_date: raw.birth_date!,
      enrollment_date: raw.enrollment_date!,
      level: raw.level as StudentLevel,
      is_active: raw.is_active ?? true,
      phone: raw.phone || undefined,
      weight: raw.weight ?? undefined,
    };

    const permissions = Object.entries(raw.permissions)
      .filter(([, checked]) => checked)
      .map(([perm]) => perm);

    if (permissions.length > 0) {
      payload.system_access = { permissions };
    }

    this.save.emit(payload);
  }
}
