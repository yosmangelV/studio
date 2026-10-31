import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type SectionHeaderLevel = 'h1' | 'h2' | 'h3';
export type SectionHeaderAlign = 'start' | 'center';

@Component({
  selector: 'ds-section-header',
  standalone: true,
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeaderComponent {
  readonly title = input.required<string>();
  readonly align = input<SectionHeaderAlign>('start');
  readonly level = input<SectionHeaderLevel>('h2');

  readonly titleClasses = computed(() => {
    const parts = ['section-header__title', `section-header__title--${this.align()}`];
    return parts.join(' ');
  });
}
