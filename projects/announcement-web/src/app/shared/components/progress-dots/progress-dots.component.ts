import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-dots',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress-dots.component.html',
  styleUrl: './progress-dots.component.scss',
})
export class ProgressDotsComponent {
  readonly total = input.required<number>();
  readonly current = input.required<number>();

  readonly dots = computed(() => Array.from({ length: this.total() }, (_, i) => i));
}
