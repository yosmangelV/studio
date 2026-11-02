import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { staffGuard } from './staff.guard';

function runGuard(isStaff: boolean) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: { isStaff: () => isStaff } }],
  });
  return TestBed.runInInjectionContext(() => staffGuard({} as never, {} as never));
}

describe('staffGuard', () => {
  it('lets admins and instructors in', () => {
    expect(runGuard(true)).toBe(true);
  });

  it('sends anyone else back to the public site', () => {
    const result = runGuard(false);
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
  });
});
