import { Component, input, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';

/**
 * A responsive image atom with a shimmer skeleton placeholder, entrance animations,
 * and an error fallback state.
 *
 * **How it works**
 * While the image loads, an animated shimmer fills the container so the layout never
 * collapses. Once the browser fires the load event, the skeleton disappears and the image
 * animates in. If `src` changes (e.g. a slideshow advances), the skeleton resets automatically
 * and the entrance animation replays for the new image.
 *
 * **Choosing an animation**
 * - `fade` — default, smooth opacity transition. Use for most images.
 * - `slide-up` — image rises into position while fading. Works well alongside animated text.
 * - `scale` — grows from 96% to full size while fading. Reserve for high-impact reveals
 *   (a key photo, an ultrasound, a surprise moment).
 * - `none` — instant display. Use when the parent already controls the transition.
 *
 * **Choosing an aspect ratio**
 * - `16:9` — landscape / wide shots
 * - `4:3` — classic horizontal photography
 * - `1:1` — square crops, symmetric layouts
 * - `3:4` — portrait / vertical photos, selfies
 * - `auto` — let the image define its own height (use carefully in flex/grid layouts)
 *
 * **Tips**
 * - `alt` is required and doubles as the accessible label in the error state.
 * - Combine `radius="full"` with `aspectRatio="1:1"` for circular avatar-style images.
 */
export type ImageAspectRatio = '16:9' | '4:3' | '1:1' | '3:4' | 'auto';
export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ImageObjectFit = 'cover' | 'contain';
export type ImageAnimation = 'none' | 'fade' | 'slide-up' | 'scale';

@Component({
  selector: 'ds-image',
  standalone: true,
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
  readonly aspectRatio = input<ImageAspectRatio>('16:9');
  readonly radius = input<ImageRadius>('md');
  readonly objectFit = input<ImageObjectFit>('cover');
  readonly animation = input<ImageAnimation>('fade');

  readonly loaded = signal(false);
  readonly hasError = signal(false);

  constructor() {
    // Reset loading state when src changes
    effect(() => {
      this.src();
      this.loaded.set(false);
      this.hasError.set(false);
    });
  }

  readonly wrapperClasses = computed(() => [
    'img-wrap',
    `img-wrap--${this.aspectRatio().replace(':', '-')}`,
    `img-wrap--${this.radius()}`,
  ].join(' '));

  readonly imgClasses = computed(() => [
    'img-wrap__img',
    `img-wrap__img--${this.objectFit()}`,
    `img-wrap__img--${this.animation()}`,
    this.loaded() ? 'img-wrap__img--loaded' : '',
  ].filter(Boolean).join(' '));

  onLoad(): void { this.loaded.set(true); }
  onError(): void { this.hasError.set(true); this.loaded.set(true); }
}
