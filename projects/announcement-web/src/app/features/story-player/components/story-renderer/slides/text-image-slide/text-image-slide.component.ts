import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AnnouncementSlide, CountdownSlide } from '../../../../../../core/models/announcement.models';

@Component({
  selector: 'app-text-image-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text-image-slide.component.html',
  styleUrl: './text-image-slide.component.scss',
})
export class TextImageSlideComponent {
  readonly slide = input.required<AnnouncementSlide | undefined>();
  readonly data = computed(() => this.slide());
}
