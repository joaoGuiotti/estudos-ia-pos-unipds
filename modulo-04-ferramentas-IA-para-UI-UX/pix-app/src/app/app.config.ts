import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { PixBaseService } from './pix-transfer/services/pix-base.service';
import { PixService } from './pix-transfer/services/pix.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: PixBaseService,
      useClass: PixService,
    },
  ],
};
