import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { AnnouncementSlide } from '../../../../../../core/models/announcement.models';
import { TextSlideComponent } from '../text-slide/text-slide.component';

@Component({
  selector: 'app-image-slide',
  standalone: true,
  imports: [TextSlideComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-slide.component.html',
  styleUrl: './image-slide.component.scss',
})
export class ImageSlideComponent {
  readonly slide = input.required<AnnouncementSlide>();

  /** Without an image the slide falls back to the text layout (design.md, story rules). */
  readonly imageUrl = computed(() => this.slide().image || null);
  readonly altText = computed(() => this.slide().altText ?? '');
  readonly caption = computed(() => this.slide().body || null);
  readonly imageLoaded = signal(false);
}
