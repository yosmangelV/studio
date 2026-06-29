import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { GymHighlight } from '../../../../core/config/gym-config.model';

@Component({
  selector: 'app-about-section',
  standalone: true,
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSectionComponent {
  readonly about      = input.required<string>();
  readonly highlights = input.required<GymHighlight[]>();
  readonly logoSrc    = input.required<string>();
}
