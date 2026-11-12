import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
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

  readonly ctaClick = output<void>();

  readonly brandAriaLabel = computed(() => `${this.brandName()} — Inicio`);
}
