import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { AnnouncementSlide } from '../../../../../../core/models/announcement.models';

@Component({
  selector: 'app-text-image-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text-image-slide.component.html',
  styleUrl: './text-image-slide.component.scss',
})
export class TextImageSlideComponent {
  readonly slide = input.required<AnnouncementSlide>();
  readonly data = computed(() => this.slide());
  readonly imageLoaded = signal(false);
}
