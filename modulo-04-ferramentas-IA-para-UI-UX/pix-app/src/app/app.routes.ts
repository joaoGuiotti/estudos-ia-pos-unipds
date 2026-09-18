import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pix',
    loadComponent: () =>
      import('./pix-transfer/pix-transfer.component').then((m) => m.PixTransferComponent),
  },
  {
    path: 'extrato',
    loadComponent: () =>
      import('./pix-history/pix-history.component').then((m) => m.PixHistoryComponent),
  },
  { path: '', redirectTo: 'pix', pathMatch: 'full' },
  { path: '**', redirectTo: 'pix' },
];
