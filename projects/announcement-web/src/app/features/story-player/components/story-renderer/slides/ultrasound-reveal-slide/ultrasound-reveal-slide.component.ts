import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { AnnouncementSlide } from '../../../../../../core/models/announcement.models';

@Component({
  selector: 'app-ultrasound-reveal-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ultrasound-reveal-slide.component.html',
  styleUrl: './ultrasound-reveal-slide.component.scss',
})
export class UltrasoundRevealSlideComponent {
  readonly slide = input.required<AnnouncementSlide>();
  readonly data = computed(() => this.slide());
  readonly imageLoaded = signal(false);
}
