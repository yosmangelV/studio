import { Component, ChangeDetectionStrategy, input, computed, HostBinding } from '@angular/core';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'ds-badge',
  standalone: true,
  template: `<ng-content />`,
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');

  @HostBinding('class') get hostClass() {
    return `badge badge--${this.variant()}`;
  }
}
