import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AnnouncementSlide, CountdownSlide } from '../../../../core/models/announcement.models';

@Component({
  selector: 'app-countdown-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './countdown-slide.component.html',
  styleUrl: './countdown-slide.component.scss',
})
export class CountdownSlideComponent {
  readonly slide = input.required<AnnouncementSlide>();
  readonly data = computed(() => this.slide() as CountdownSlide);
}
