import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home-page'),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page'),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'students',
        loadChildren: () => import('./features/students/students.routes'),
      },
    ],
  },
];
