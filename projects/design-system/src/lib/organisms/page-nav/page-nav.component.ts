import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NavLink, PageNavMenuComponent } from '../../molecules/page-nav-menu/page-nav-menu.component';

/**
 * Fixed page navigation: brand, section links and a CTA. From 768px the links and
 * the CTA sit in the bar; below that they move into `ds-page-nav-menu`.
 */
@Component({
  selector: 'ds-page-nav',
  standalone: true,
  imports: [PageNavMenuComponent],
  templateUrl: './page-nav.component.html',
  styleUrl: './page-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNavComponent {
  readonly brandName     = input.required<string>();
  readonly brandSubtitle = input.required<string>();
  readonly brandHref     = input<string>('#');
  readonly links         = input.required<NavLink[]>();
  readonly ctaLabel      = input<string>('Acceder');
  /** Accessible name of the menu button shown below 768px. */
  readonly menuLabel     = input<string>('Menú');
  /** Accessible name of the nav landmark. */
  readonly navLabel      = input<string>('Navegación principal');
  /** Appended to the brand name in the brand link's accessible name ("Brand — Inicio"). */
  readonly homeLabel     = input<string>('Inicio');

  readonly ctaClick = output<void>();

  readonly brandAriaLabel = computed(() => `${this.brandName()} — ${this.homeLabel()}`);

  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // The menu panel caps its height at the viewport below the bar. The SCSS sets
    // --page-nav-bar-height from the padding and a 44px control; projected content can
    // make the bar taller, so the real height replaces it once the bar renders.
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const bar = this.bar().nativeElement;
      const observer = new ResizeObserver(() => {
        bar.style.setProperty('--page-nav-bar-height', `${bar.offsetHeight}px`);
      });
      observer.observe(bar);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
