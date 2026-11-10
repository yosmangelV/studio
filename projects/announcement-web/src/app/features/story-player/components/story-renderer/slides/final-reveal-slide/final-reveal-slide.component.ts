import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Heart, LucideAngularModule } from 'lucide-angular';
import { AnnouncementSlide } from '../../../../../../core/models/announcement.models';

@Component({
  selector: 'app-final-reveal-slide',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './final-reveal-slide.component.html',
  styleUrl: './final-reveal-slide.component.scss',
})
export class FinalRevealSlideComponent {
  readonly slide = input.required<AnnouncementSlide>();
  readonly data = computed(() => this.slide());
  readonly imageLoaded = signal(false);
  protected readonly heartIcon = Heart;
}
