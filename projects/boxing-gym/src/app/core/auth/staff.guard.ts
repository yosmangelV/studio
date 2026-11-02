import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Admins and instructors. Anyone else (e.g. a student account) goes back to the public site. */
export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isStaff() ? true : inject(Router).createUrlTree(['/']);
};
