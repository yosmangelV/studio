import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GymProfileService } from './core/gym-profile/gym-profile.service';
import { LoadingComponent } from './shared/components/loading/loading.component';

/** Long enough for the gloves to meet (50% of the 2.4s cycle), so the splash never just flashes. */
export const MIN_SPLASH_MS = 1200;
/** Past this the landing shows anyway, with whatever data it has. */
export const MAX_SPLASH_MS = 3000;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** Only the public landing gets the splash; /login and the panel open directly. */
  private readonly isLanding = inject(Location).path().split(/[?#]/)[0] === '';

  /**
   * Injected here, not only in the home page, so the gym data loads while the
   * splash plays instead of after it. Returning visitors render from cache: no splash.
   */
  private readonly gymProfile = this.isLanding ? inject(GymProfileService) : null;
  private readonly needsSplash = this.gymProfile !== null && !this.gymProfile.hasCache;

  private readonly minElapsed = signal(false);
  private readonly maxElapsed = signal(false);

  protected readonly showSplash = computed(
    () =>
      this.needsSplash &&
      !this.maxElapsed() &&
      !(this.minElapsed() && this.gymProfile!.settled()),
  );

  constructor() {
    if (!this.needsSplash) return;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => this.minElapsed.set(true), reducedMotion ? 0 : MIN_SPLASH_MS);
    setTimeout(() => this.maxElapsed.set(true), MAX_SPLASH_MS);
  }
}
