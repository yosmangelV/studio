import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  readonly name     = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly tagline  = input.required<string>();
  readonly logoSrc  = input.required<string>();

  protected readonly headlineTop = computed(() => {
    const words = this.name().trim().split(/\s+/);
    return words.slice(0, -1).join(' ');
  });

  protected readonly headlineMain = computed(() => {
    const words = this.name().trim().split(/\s+/);
    return words[words.length - 1];
  });
}
