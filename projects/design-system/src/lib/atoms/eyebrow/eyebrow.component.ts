import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type EyebrowAlign = 'start' | 'center';

@Component({
  selector: 'ds-eyebrow',
  standalone: true,
  templateUrl: './eyebrow.component.html',
  styleUrl: './eyebrow.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EyebrowComponent {
  readonly label = input.required<string>();
  readonly align = input<EyebrowAlign>('start');

  readonly classes = computed(() => {
    const parts = ['eyebrow', this.align() === 'center' ? 'eyebrow--center' : ''];
    return parts.filter(Boolean).join(' ');
  });
}
