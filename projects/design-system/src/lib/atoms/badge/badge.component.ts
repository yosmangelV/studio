import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'ds-badge',
  standalone: true,
  template: `<ng-content />`,
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');

  protected readonly hostClass = computed(() => `badge badge--${this.variant()}`);
}
