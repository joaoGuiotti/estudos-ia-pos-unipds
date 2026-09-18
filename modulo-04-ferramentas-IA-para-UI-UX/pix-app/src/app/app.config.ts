import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { routes } from './app.routes';
import { PixBaseService } from './pix-transfer/services/pix-base.service';
import { PixService } from './pix-transfer/services/pix.service';
import { PixHistoryBaseService } from './pix-history/services/pix-history-base.service';
import { PixHistoryService } from './pix-history/services/pix-history.service';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    {
      provide: PixBaseService,
      useClass: PixService,
    },
    {
      provide: PixHistoryBaseService,
      useClass: PixHistoryService,
    },
  ],
};
