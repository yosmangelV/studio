import { ChangeDetectionStrategy, Component, computed, input, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { TextSlideComponent } from './slides/text-slide/text-slide.component';
import { ImageSlideComponent } from './slides/image-slide/image-slide.component';
import { TextImageSlideComponent } from './slides/text-image-slide/text-image-slide.component';
import { CountdownSlideComponent } from './slides/countdown-slide/countdown-slide.component';
import { EnvelopeSlideComponent } from './slides/envelope-slide/envelope-slide.component';
import { UltrasoundRevealSlideComponent } from './slides/ultrasound-reveal-slide/ultrasound-reveal-slide.component';
import { FinalRevealSlideComponent } from './slides/final-reveal-slide/final-reveal-slide.component';
import { AnnouncementSlide, MessageType, SlideType } from '../../../../core/models/announcement.models';
import { IntroSlideComponent } from './slides/intro/intro.component';

const SLIDE_COMPONENT_MAP: Record<MessageType, Type<unknown>> = {
  [MessageType.INTRO]: IntroSlideComponent,
  [MessageType.TEXT]: TextSlideComponent,
  [MessageType.IMAGE]: ImageSlideComponent,
  [MessageType.TEXT_IMAGE]: TextImageSlideComponent,
  [MessageType.COUNTDOWN]: CountdownSlideComponent,
  [MessageType.ENVELOPE]: EnvelopeSlideComponent,
  [MessageType.ULTRASOUND_REVEAL]: UltrasoundRevealSlideComponent,
  [MessageType.FINAL_REVEAL]: FinalRevealSlideComponent,
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
  readonly slide = input.required<AnnouncementSlide | undefined>();

  readonly component = computed(() => SLIDE_COMPONENT_MAP[this.slide()?.messageType ?? MessageType.TEXT]);
  readonly inputs = computed(() => ({ slide: this.slide() }));
}
