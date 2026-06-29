import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) =>
  from(inject(AuthService).getSession()).pipe(
    switchMap(session => {
      if (!session) return next(req);

      return next(
        req.clone({
          setHeaders: { Authorization: `Bearer ${session.access_token}` },
        }),
      );
    }),
  );
