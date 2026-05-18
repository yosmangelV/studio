import { Component, input, computed, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);

  @HostBinding('class') get hostClass() {
    return 'inline-flex';
  }

  readonly classes = computed(() => {
    const parts = [
      'btn',
      `btn--${this.variant()}`,
      `btn--${this.size()}`,
      this.fullWidth() ? 'w-full' : '',
    ];
    return parts.filter(Boolean).join(' ');
  });

  readonly isDisabled = computed(() => this.disabled() || this.loading());
}
