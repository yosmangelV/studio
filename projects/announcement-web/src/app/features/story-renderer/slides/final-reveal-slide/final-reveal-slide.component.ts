import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AnnouncementSlide, FinalRevealSlide } from '../../../../core/models/announcement.models';

@Component({
  selector: 'app-final-reveal-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './final-reveal-slide.component.html',
  styleUrl: './final-reveal-slide.component.scss',
})
export class FinalRevealSlideComponent {
  readonly slide = input.required<AnnouncementSlide>();
  readonly data = computed(() => this.slide() as FinalRevealSlide);
}
