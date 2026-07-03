import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { EyebrowComponent } from '../../atoms/eyebrow/eyebrow.component';

@Component({
  selector: 'ds-hero-section',
  standalone: true,
  imports: [EyebrowComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  readonly eyebrow            = input.required<string>();
  readonly headlineTop        = input.required<string>();
  readonly headlineMain       = input.required<string>();
  readonly tagline            = input.required<string>();
  readonly primaryCtaLabel    = input.required<string>();
  readonly primaryCtaHref     = input.required<string>();
  readonly secondaryCtaLabel  = input.required<string>();
  readonly secondaryCtaHref   = input.required<string>();
  readonly logoSrc            = input<string>('');
}
