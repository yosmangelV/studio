import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, catchError, finalize, tap } from 'rxjs';
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
  readonly mutationSuccess = signal(0);

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.listStudentsStudentsGet()
      .pipe(
        tap(data => this.students.set(data ?? [])),
        catchError(() => {
          this.error.set('Error al cargar los alumnos.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  create(payload: StudentCreate): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.createStudentStudentsPost(payload)
      .pipe(
        tap(student => {
          this.students.update(list => [...list, student]);
          this.mutationSuccess.update(n => n + 1);
        }),
        catchError(() => {
          this.error.set('Error al crear el alumno.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  update(id: string, payload: StudentUpdate): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.updateStudentStudentsStudentIdPatch(id, payload)
      .pipe(
        tap(updated => {
          this.students.update(list => list.map(s => (s.id === id ? updated : s)));
          this.mutationSuccess.update(n => n + 1);
        }),
        catchError(() => {
          this.error.set('Error al actualizar el alumno.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  remove(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.deleteStudentStudentsStudentIdDelete(id)
      .pipe(
        tap(() => {
          this.students.update(list => list.filter(s => s.id !== id));
          this.mutationSuccess.update(n => n + 1);
        }),
        catchError(() => {
          this.error.set('Error al eliminar el alumno.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }
}
