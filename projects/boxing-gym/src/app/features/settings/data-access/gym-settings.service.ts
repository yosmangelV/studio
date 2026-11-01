import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, finalize, tap } from 'rxjs';
import {
  BoxingGymAPIService,
  ClassesUpdate,
  GymProfileFull,
  GymProfileUpdate,
  ScheduleUpdate,
} from '../../../core/api/gym-profile.service';

export type SettingsBlock = 'profile' | 'schedule' | 'classes';

/** Turns a FastAPI 422 into one readable line; anything else gets a generic message. */
function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse && err.status === 422 && Array.isArray(err.error?.detail)) {
    return err.error.detail.map((d: { msg: string }) => d.msg.replace(/^Value error, /, '')).join(' · ');
  }
  return 'No se pudo guardar. Inténtalo de nuevo.';
}

@Injectable({ providedIn: 'root' })
export class GymSettingsService {
  private readonly api = inject(BoxingGymAPIService);

  readonly data    = signal<GymProfileFull | null>(null);
  readonly loading = signal(false);
  readonly saving  = signal<SettingsBlock | null>(null);
  readonly saved   = signal<SettingsBlock | null>(null);
  readonly error   = signal<{ block: SettingsBlock | 'load'; message: string } | null>(null);

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getGymProfileGymProfileGet()
      .pipe(
        tap((data) => this.data.set(data)),
        catchError(() => {
          this.error.set({ block: 'load', message: 'No se pudieron cargar los datos del gimnasio.' });
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  saveProfile(payload: GymProfileUpdate): void {
    this.save('profile', this.api.updateGymProfileGymProfileProfilePut(payload));
  }

  saveSchedule(payload: ScheduleUpdate): void {
    this.save('schedule', this.api.replaceGymScheduleGymProfileSchedulePut(payload));
  }

  saveClasses(payload: ClassesUpdate): void {
    this.save('classes', this.api.replaceGymClassesGymProfileClassesPut(payload));
  }

  private save(block: SettingsBlock, request: Observable<GymProfileFull>): void {
    this.saving.set(block);
    this.saved.set(null);
    this.error.set(null);
    request
      .pipe(
        tap((data) => {
          this.data.set(data);
          this.saved.set(block);
        }),
        catchError((err) => {
          this.error.set({ block, message: errorMessage(err) });
          return EMPTY;
        }),
        finalize(() => this.saving.set(null)),
      )
      .subscribe();
  }
}
