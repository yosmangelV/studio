import { ChangeDetectionStrategy, Component, effect, input, output, Type, ViewContainerRef, viewChild } from '@angular/core';
import { AnnouncementSlide, MessageType } from '../../../../core/models/announcement.models';
import { TextSlideComponent } from './slides/text-slide/text-slide.component';
import { ImageSlideComponent } from './slides/image-slide/image-slide.component';
import { TextImageSlideComponent } from './slides/text-image-slide/text-image-slide.component';
import { CountdownSlideComponent } from './slides/countdown-slide/countdown-slide.component';
import { UltrasoundRevealSlideComponent } from './slides/ultrasound-reveal-slide/ultrasound-reveal-slide.component';
import { FinalRevealSlideComponent } from './slides/final-reveal-slide/final-reveal-slide.component';
import { IntroSlideComponent } from './slides/intro/intro.component';

const SLIDE_COMPONENT_MAP: Record<MessageType, Type<unknown>> = {
  [MessageType.INTRO]: IntroSlideComponent,
  [MessageType.TEXT]: TextSlideComponent,
  [MessageType.IMAGE]: ImageSlideComponent,
  [MessageType.TEXT_IMAGE]: TextImageSlideComponent,
  [MessageType.COUNTDOWN]: CountdownSlideComponent,
  [MessageType.ULTRASOUND_REVEAL]: UltrasoundRevealSlideComponent,
  [MessageType.FINAL_REVEAL]: FinalRevealSlideComponent,
};

@Component({
  selector: 'app-slide-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #anchor />`,
  styles: [`:host { display: block; height: 100%; }`],
})
export class SlideRendererComponent {
  private readonly vcr = viewChild.required('anchor', { read: ViewContainerRef });

  readonly slide = input.required<AnnouncementSlide | undefined>();
  readonly completed = output<void>();

  constructor() {
    effect((onCleanup) => {
      const vcr = this.vcr();
      const componentType = SLIDE_COMPONENT_MAP[this.slide()?.messageType ?? MessageType.TEXT];

      vcr.clear();
      const ref = vcr.createComponent(componentType as Type<any>);
      ref.setInput('slide', this.slide());

      const instance = ref.instance as Record<string, any>;
      let sub: { unsubscribe(): void } | undefined;
      if (typeof instance['completed']?.subscribe === 'function') {
        sub = instance['completed'].subscribe(() => this.completed.emit());
      }

      onCleanup(() => sub?.unsubscribe());
    });
  }
}
