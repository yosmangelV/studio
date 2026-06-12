import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AnnouncementSlide } from '../../../../../../core/models/announcement.models';

@Component({
  selector: 'app-text-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text-slide.component.html',
  styleUrl: './text-slide.component.scss',
})
export class TextSlideComponent {
  readonly slide = input.required<AnnouncementSlide>();
  readonly data = computed(() => this.slide());
}
