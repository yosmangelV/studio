import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  BoxingGymAPIService,
  StudentCreate,
  StudentResponse,
  StudentUpdate,
} from '../../../core/api/students.service';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly api = inject(BoxingGymAPIService);

  readonly students = signal<StudentResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = computed(() => this.students().length);

  async loadAll(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.api.listStudentsStudentsGet());
      this.students.set(data ?? []);
    } catch {
      this.error.set('Error al cargar los alumnos.');
    } finally {
      this.loading.set(false);
    }
  }

  async create(payload: StudentCreate): Promise<StudentResponse> {
    const student = await firstValueFrom(
      this.api.createStudentStudentsPost(payload)
    );
    this.students.update(list => [...list, student]);
    return student;
  }

  async update(id: string, payload: StudentUpdate): Promise<void> {
    const updated = await firstValueFrom(
      this.api.updateStudentStudentsStudentIdPatch(id, payload)
    );
    this.students.update(list => list.map(s => (s.id === id ? updated : s)));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.api.deleteStudentStudentsStudentIdDelete(id));
    this.students.update(list => list.filter(s => s.id !== id));
  }
}
