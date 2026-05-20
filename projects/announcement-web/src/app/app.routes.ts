import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'announcement/:code',
    loadComponent: () =>
      import('./features/story-player/story-player.component').then(
        (m) => m.StoryPlayerComponent,
      ),
  },
  { path: '', redirectTo: '/announcement/DEMO-FRIENDS', pathMatch: 'full' },
  { path: '**', redirectTo: '/announcement/DEMO-FRIENDS' },
];
