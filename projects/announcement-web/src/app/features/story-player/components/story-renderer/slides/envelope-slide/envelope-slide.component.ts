import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AnnouncementSlide, CountdownSlide } from '../../../../../../core/models/announcement.models';

@Component({
  selector: 'app-envelope-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './envelope-slide.component.html',
  styleUrl: './envelope-slide.component.scss',
})
export class EnvelopeSlideComponent {
  readonly slide = input.required<AnnouncementSlide | undefined>();
  readonly data = computed(() => this.slide());
}
