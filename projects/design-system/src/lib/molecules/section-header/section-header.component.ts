import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { EyebrowComponent, EyebrowAlign } from '../../atoms/eyebrow/eyebrow.component';

export type SectionHeaderLevel = 'h1' | 'h2' | 'h3';

@Component({
  selector: 'ds-section-header',
  standalone: true,
  imports: [EyebrowComponent],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeaderComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly titleAccent = input<string>('');
  readonly align = input<EyebrowAlign>('start');
  readonly level = input<SectionHeaderLevel>('h2');

  readonly titleClasses = computed(() => {
    const parts = ['section-header__title', `section-header__title--${this.align()}`];
    return parts.join(' ');
  });
}
