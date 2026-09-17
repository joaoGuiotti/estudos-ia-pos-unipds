import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pix',
    loadComponent: () =>
      import('./pix-transfer/pix-transfer.component').then((m) => m.PixTransferComponent),
  },
  { path: '', redirectTo: 'pix', pathMatch: 'full' },
  { path: '**', redirectTo: 'pix' },
];
