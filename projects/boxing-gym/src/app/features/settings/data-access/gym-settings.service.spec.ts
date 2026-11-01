import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { BoxingGymAPIService, GymProfileFull } from '../../../core/api/gym-profile.service';
import { GymSettingsService } from './gym-settings.service';

const FULL: GymProfileFull = { profile: null, schedule: [], classes: [] };

function setup(api: Partial<Record<keyof BoxingGymAPIService, unknown>>) {
  TestBed.configureTestingModule({ providers: [{ provide: BoxingGymAPIService, useValue: api }] });
  return TestBed.inject(GymSettingsService);
}

describe('GymSettingsService', () => {
  it('stores the response and marks the saved block', () => {
    const service = setup({ replaceGymScheduleGymProfileSchedulePut: () => of(FULL) });
    service.saveSchedule({ slots: [] });
    expect(service.data()).toEqual(FULL);
    expect(service.saved()).toBe('schedule');
    expect(service.saving()).toBeNull();
  });

  it('turns a 422 into the validation messages of that block', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: { detail: [{ msg: 'Value error, slots overlap: 18:00-19:30 and 19:00-20:00' }] },
    });
    const service = setup({ replaceGymScheduleGymProfileSchedulePut: () => throwError(() => error) });
    service.saveSchedule({ slots: [] });
    expect(service.error()).toEqual({ block: 'schedule', message: 'slots overlap: 18:00-19:30 and 19:00-20:00' });
    expect(service.saved()).toBeNull();
  });

  it('uses a generic message for other errors', () => {
    const service = setup({
      updateGymProfileGymProfileProfilePut: () => throwError(() => new HttpErrorResponse({ status: 500 })),
    });
    service.saveProfile({});
    expect(service.error()).toEqual({ block: 'profile', message: 'No se pudo guardar. Inténtalo de nuevo.' });
  });
});
