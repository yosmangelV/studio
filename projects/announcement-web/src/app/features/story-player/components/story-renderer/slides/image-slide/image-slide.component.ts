import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { AnnouncementSlide, CountdownSlide } from '../../../../../../core/models/announcement.models';

@Component({
  selector: 'app-image-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-slide.component.html',
  styleUrl: './image-slide.component.scss',
})
export class ImageSlideComponent {
  readonly slide = input.required<AnnouncementSlide>();
  readonly data = computed(() => this.slide());
  readonly imageLoaded = signal(false);
}
