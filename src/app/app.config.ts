import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { authInterceptor } from './interceptors/authInterceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ],
};
