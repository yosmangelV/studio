import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BadgeComponent, ButtonComponent } from 'design-system';
import { StudentLevel, StudentResponse } from '../../../../core/api/students.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentListComponent {
  readonly students = input.required<StudentResponse[]>();

  readonly edit = output<StudentResponse>();
  readonly deletedStudent = output<string>();

  protected readonly levelLabels: Record<StudentLevel, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  protected readonly levelVariants: Record<StudentLevel, 'default' | 'warning' | 'success'> = {
    beginner: 'default',
    intermediate: 'warning',
    advanced: 'success',
  };
}
