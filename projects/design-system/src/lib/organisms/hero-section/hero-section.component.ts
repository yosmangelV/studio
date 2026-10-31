import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'ds-hero-section',
  standalone: true,
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  readonly headlineTop        = input.required<string>();
  readonly headlineMain       = input.required<string>();
  readonly tagline            = input.required<string>();
  readonly primaryCtaLabel    = input.required<string>();
  readonly primaryCtaHref     = input.required<string>();
  readonly secondaryCtaLabel  = input.required<string>();
  readonly secondaryCtaHref   = input.required<string>();
  readonly logoSrc            = input<string>('');
}
