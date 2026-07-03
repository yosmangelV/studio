import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

export interface NavLink {
  label: string;
  href: string;
}

@Component({
  selector: 'ds-page-nav',
  standalone: true,
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

  readonly ctaClick = output<void>();

  readonly brandAriaLabel = computed(() => `${this.brandName()} — Inicio`);
}
