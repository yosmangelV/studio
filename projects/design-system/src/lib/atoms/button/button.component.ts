import { Component, input, computed, HostBinding } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * The primary interactive element of the design system.
 *
 * **Variants**
 * - `primary` — main call to action, use once per section
 * - `secondary` — supporting actions, bordered style
 * - `ghost` — low-emphasis actions, transparent background
 * - `danger` — destructive actions (delete, remove)
 *
 * **Icons**
 * Pass a Lucide icon to `iconLeft` or `iconRight`. Use `iconOnly` with a single icon
 * and an `aria-label` for icon-only buttons (close, add, search…).
 *
 * **States**
 * Set `loading` to show a spinner and block interaction while an async operation runs.
 * The button keeps its size so the layout does not shift.
 */
@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);
  readonly iconLeft = input<LucideIconData | null>(null);
  readonly iconRight = input<LucideIconData | null>(null);
  readonly iconOnly = input(false);

  @HostBinding('class') get hostClass() {
    return this.fullWidth() ? 'block w-full' : 'inline-flex';
  }

  readonly classes = computed(() => {
    const parts = [
      'btn',
      `btn--${this.variant()}`,
      `btn--${this.size()}`,
      this.iconOnly() ? 'btn--icon-only' : '',
      this.fullWidth() ? 'w-full' : '',
    ];
    return parts.filter(Boolean).join(' ');
  });

  readonly isDisabled = computed(() => this.disabled() || this.loading());

  readonly iconSize = computed(() => {
    const map: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 };
    return map[this.size()];
  });
}
