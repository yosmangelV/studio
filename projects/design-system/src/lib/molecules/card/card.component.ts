import { Component, input, computed } from '@angular/core';

export type CardVariant = 'elevated' | 'outlined' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  readonly variant = input<CardVariant>('elevated');
  readonly padding = input<CardPadding>('md');
  readonly interactive = input(false);
  readonly fullHeight = input(false);

  readonly classes = computed(() => {
    const parts = [
      'card',
      `card--${this.variant()}`,
      `card--pad-${this.padding()}`,
      this.interactive() ? 'card--interactive' : '',
      this.fullHeight() ? 'card--full-height' : '',
    ];
    return parts.filter(Boolean).join(' ');
  });
}
