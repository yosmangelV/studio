import { ChangeDetectionStrategy, Component, DestroyRef, inject, output, signal } from '@angular/core';

const STEP_MS = 1000;

@Component({
  selector: 'app-countdown-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './countdown-slide.component.html',
  styleUrl: './countdown-slide.component.scss',
})
export class CountdownSlideComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly completed = output<void>();
  readonly count = signal(3);

  constructor() {
    const interval = setInterval(() => {
      const next = this.count() - 1;
      this.count.set(next);

      if (next === 0) {
        clearInterval(interval);
        this.completed.emit();
      }
    }, STEP_MS);

    this.destroyRef.onDestroy(() => clearInterval(interval));
  }
}
