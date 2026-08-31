import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./payments-dashboard'),
  },
  {
    path: 'analytics',
    loadComponent: () => import('./payments-analytics'),
  },
];

export default routes;
