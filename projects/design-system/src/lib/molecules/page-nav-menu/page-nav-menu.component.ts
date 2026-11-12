import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideAngularModule, Menu, X } from 'lucide-angular';

export interface NavLink {
  label: string;
  href: string;
}

let nextMenuId = 0;

/**
 * The page navigation's menu for narrow screens (WAI-ARIA disclosure pattern).
 *
 * A button with `aria-expanded` opens a panel with the section links and the CTA.
 * Escape, a link, the CTA, a click outside or focus leaving the menu closes it, and
 * Escape returns focus to the button. Closing on focus out keeps the open panel from
 * covering whatever the keyboard reaches next (WCAG 2.4.11). The component hides itself from 768px, where `ds-page-nav` shows the
 * links in the bar. The panel is absolutely positioned: place it inside a positioned
 * bar (as `ds-page-nav` does) so it hangs under it, full width.
 */
@Component({
  selector: 'ds-page-nav-menu',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './page-nav-menu.component.html',
  styleUrl: './page-nav-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '(document:click)': 'onDocumentClick($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class PageNavMenuComponent {
  readonly links     = input.required<NavLink[]>();
  readonly ctaLabel  = input<string>('Acceder');
  /** Accessible name of the menu button. */
  readonly menuLabel = input<string>('Menú');

  readonly ctaClick = output<void>();

  protected readonly open = signal(false);
  protected readonly panelId = `ds-page-nav-menu-${++nextMenuId}`;
  protected readonly icon = computed(() => (this.open() ? X : Menu));

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');

  protected toggle(): void {
    this.open.update((isOpen) => !isOpen);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onCtaClick(): void {
    this.close();
    this.ctaClick.emit();
  }

  protected onEscape(): void {
    if (!this.open()) return;
    this.close();
    this.button().nativeElement.focus();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (this.open() && next && !this.host.nativeElement.contains(next)) {
      this.close();
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
