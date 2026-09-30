import { Injectable, inject, signal } from '@angular/core';
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

  readonly limit = 20;

  readonly students = signal<StudentResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);
  readonly pages = signal(0);
  readonly currentPage = signal(1);
  readonly search = signal('');
  readonly mutationSuccess = signal(0);

  loadAll(): void {
    const offset = (this.currentPage() - 1) * this.limit;
    const searchVal = this.search();
    const params = searchVal
      ? { search: searchVal, limit: this.limit, offset }
      : { limit: this.limit, offset };
    this.loading.set(true);
    this.error.set(null);
    this.api.listStudentsStudentsGet(params)
      .pipe(
        tap(result => {
          this.students.set(result.data ?? []);
          this.total.set(result.total);
          this.pages.set(result.pages);
        }),
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
        tap(() => {
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
