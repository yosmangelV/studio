import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AnnouncementSlide, CountdownSlide, IntroSlide } from '../../../../../../core/models/announcement.models';

@Component({
  selector: 'app-intro-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss',
})
export class IntroSlideComponent {
  readonly slide = input.required<AnnouncementSlide>();
}
