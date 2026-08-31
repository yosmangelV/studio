import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const DEV_BASE = 'http://127.0.0.1:8000';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(DEV_BASE)) return next(req);

  return next(req.clone({ url: req.url.replace(DEV_BASE, environment.apiUrl) }));
};
