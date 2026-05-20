import { ChangeDetectionStrategy, Component, computed, input, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { AnnouncementSlide, SlideType } from '../../core/models/announcement.models';
import { TextSlideComponent } from './slides/text-slide/text-slide.component';
import { ImageSlideComponent } from './slides/image-slide/image-slide.component';
import { TextImageSlideComponent } from './slides/text-image-slide/text-image-slide.component';
import { CountdownSlideComponent } from './slides/countdown-slide/countdown-slide.component';
import { EnvelopeSlideComponent } from './slides/envelope-slide/envelope-slide.component';
import { UltrasoundRevealSlideComponent } from './slides/ultrasound-reveal-slide/ultrasound-reveal-slide.component';
import { FinalRevealSlideComponent } from './slides/final-reveal-slide/final-reveal-slide.component';

const SLIDE_COMPONENT_MAP: Record<SlideType, Type<unknown>> = {
  intro: TextSlideComponent,
  text: TextSlideComponent,
  image: ImageSlideComponent,
  'text-image': TextImageSlideComponent,
  countdown: CountdownSlideComponent,
  envelope: EnvelopeSlideComponent,
  'ultrasound-reveal': UltrasoundRevealSlideComponent,
  'final-reveal': FinalRevealSlideComponent,
};

@Component({
  selector: 'app-slide-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  template: `
    <ng-container
      [ngComponentOutlet]="component()"
      [ngComponentOutletInputs]="inputs()"
    />
  `,
  styles: [`:host { display: block; height: 100%; }`],
})
export class SlideRendererComponent {
  readonly slide = input.required<AnnouncementSlide>();

  readonly component = computed(() => SLIDE_COMPONENT_MAP[this.slide().type]);
  readonly inputs = computed(() => ({ slide: this.slide() }));
}
