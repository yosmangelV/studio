import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'announcement/:code',
    loadComponent: () =>
      import('./features/story-player/story-player.component').then((m) => m.StoryPlayerComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/private-landing/private-landing.component').then(
        (m) => m.PrivateLandingComponent,
      ),
  },
];
