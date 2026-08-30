import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ButtonComponent } from 'design-system';
import { StudentCreate, StudentResponse } from '../../core/api/students.service';
import { StudentsService } from './data-access/students.service';
import { StudentFormComponent } from './ui/student-form/student-form.component';
import { StudentListComponent } from './ui/student-list/student-list.component';

type PageMode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-students-page',
  standalone: true,
  imports: [ButtonComponent, StudentListComponent, StudentFormComponent],
  templateUrl: './students-page.html',
  styleUrl: './students-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StudentsPage {
  protected readonly service = inject(StudentsService);

  protected readonly mode = signal<PageMode>('list');
  protected readonly selectedStudent = signal<StudentResponse | null>(null);

  constructor() {
    this.service.loadAll();
    effect(() => {
      if (this.service.mutationSuccess() > 0) {
        this.mode.set('list');
        this.selectedStudent.set(null);
      }
    }, { allowSignalWrites: true });
  }

  protected onCreate(): void {
    this.selectedStudent.set(null);
    this.mode.set('create');
  }

  protected onEdit(student: StudentResponse): void {
    this.selectedStudent.set(student);
    this.mode.set('edit');
  }

  protected onCancel(): void {
    this.selectedStudent.set(null);
    this.mode.set('list');
  }

  protected onSave(payload: StudentCreate): void {
    const current = this.selectedStudent();
    if (this.mode() === 'edit' && current) {
      this.service.update(current.id, payload);
    } else {
      this.service.create(payload);
    }
  }

  protected onDelete(id: string): void {
    if (!confirm('¿Eliminar este alumno? Esta acción no se puede deshacer.')) return;
    this.service.remove(id);
  }
}
