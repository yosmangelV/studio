import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SectionHeaderComponent } from 'design-system';
import type { HighlightView } from '../../../../core/gym-profile/gym-profile.model';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [SectionHeaderComponent],
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSectionComponent {
  readonly about      = input.required<string>();
  readonly highlights = input.required<HighlightView[]>();
  readonly logoSrc    = input.required<string>();
}
