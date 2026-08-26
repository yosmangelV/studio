import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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

  protected async onSave(payload: StudentCreate): Promise<void> {
    const current = this.selectedStudent();
    if (this.mode() === 'edit' && current) {
      await this.service.update(current.id, payload);
    } else {
      await this.service.create(payload);
    }
    this.onCancel();
  }

  protected async onDelete(id: string): Promise<void> {
    if (!confirm('¿Eliminar este alumno? Esta acción no se puede deshacer.')) return;
    await this.service.remove(id);
  }
}
