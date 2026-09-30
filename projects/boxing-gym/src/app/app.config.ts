import { APP_INITIALIZER, ApplicationConfig, inject, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { GYM_CONFIG } from './core/config/gym-config.token';
import { gymConfig } from './core/config/gym.config';
import { AuthService } from './core/auth/auth.service';
import { InactivityService } from './core/auth/inactivity.service';
import { authInterceptor } from './core/auth/auth.interceptor';
import { apiBaseUrlInterceptor } from './core/api/api-base-url.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, authInterceptor])),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    { provide: GYM_CONFIG, useValue: gymConfig },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const auth       = inject(AuthService);
        const inactivity = inject(InactivityService);
        return async () => {
          await auth.init();
          if (auth.isAuthenticated()) {
            inactivity.start();
          }
        };
      },
      multi: true,
    },
  ],
};
