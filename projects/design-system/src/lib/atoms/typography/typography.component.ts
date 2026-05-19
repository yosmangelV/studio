import { Component, input, computed } from '@angular/core';

/**
 * The typographic scale of the design system. Use `ds-text` instead of raw HTML
 * heading and paragraph elements to keep font sizes, weights, and line-heights
 * consistent across the app.
 *
 * **Variants**
 * - `display` — hero / landing page headlines (4xl, bold)
 * - `h1`–`h6` — section headings at descending sizes
 * - `body-lg`, `body`, `body-sm` — body copy at three sizes
 * - `label` — form labels, tags, emphasized metadata (sm, semibold)
 * - `caption` — helper text, timestamps, secondary metadata (xs)
 *
 * **Semantic tag**
 * Each variant maps to a sensible HTML element by default (`h1`–`h6` → heading elements,
 * `body-*` → `<p>`, `label`/`caption` → `<span>`). Override with the `as` input when the
 * visual style and the document hierarchy need to differ — for example, a section title that
 * is visually `h2` but semantically should be `h3`.
 *
 * **Colors**
 * Colors are driven by CSS custom properties, so they update automatically in dark mode.
 * Use `muted` or `secondary` for supporting copy and `link` for inline anchor text.
 */
export type TypographyVariant =
  | 'display'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'body-lg' | 'body' | 'body-sm'
  | 'label' | 'caption';

export type TypographyColor =
  | 'primary' | 'secondary' | 'muted' | 'link' | 'error' | 'success' | 'inverse';

export type TypographyTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label';

const DEFAULT_TAGS: Record<TypographyVariant, TypographyTag> = {
  display:  'h1',
  h1:       'h1',
  h2:       'h2',
  h3:       'h3',
  h4:       'h4',
  h5:       'h5',
  h6:       'h6',
  'body-lg': 'p',
  body:     'p',
  'body-sm': 'p',
  label:    'span',
  caption:  'span',
};

@Component({
  selector: 'ds-text',
  standalone: true,
  templateUrl: './typography.component.html',
  styleUrl: './typography.component.scss',
})
export class TypographyComponent {
  readonly variant = input<TypographyVariant>('body');
  readonly color = input<TypographyColor>('primary');
  readonly as = input<TypographyTag | null>(null);
  readonly truncate = input(false);

  readonly tag = computed<TypographyTag>(() => this.as() ?? DEFAULT_TAGS[this.variant()]);

  readonly classes = computed(() => {
    const parts = [
      'text',
      `text--${this.variant()}`,
      `text--${this.color()}`,
      this.truncate() ? 'text--truncate' : '',
    ];
    return parts.filter(Boolean).join(' ');
  });
}
