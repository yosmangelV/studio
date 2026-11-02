import { ChangeDetectionStrategy, Component, computed, inject, LOCALE_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Languages, LucideAngularModule } from 'lucide-angular';

// A language is not a country: names and codes, no flags (and no emoji, Floor 7).
const LOCALE_LABELS: Record<string, { code: string; label: string }> = {
  es: { code: 'ES', label: 'Español' },
  en: { code: 'EN', label: 'English' },
};

@Component({
  selector: 'app-locale-switcher',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './locale-switcher.component.html',
  styleUrl: './locale-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocaleSwitcherComponent {
  protected readonly icons = { language: Languages };

  private readonly localeId = inject(LOCALE_ID);
  private readonly document  = inject(DOCUMENT);

  protected readonly currentLocale = this.localeId;
  protected readonly alternateLocale = this.localeId === 'es' ? 'en' : 'es';

  protected readonly currentLabel   = LOCALE_LABELS[this.currentLocale];
  protected readonly alternateLabel = LOCALE_LABELS[this.alternateLocale];

  protected switchLocale(): void {
    const origin = this.document.location.origin;
    const path   = this.document.location.pathname;

    // In production, the app is served under /<locale>/ so we strip and replace.
    // In development (ng serve), the app runs at root with no locale prefix —
    // navigating to /<alternate>/<path> loads the second dev server if running on
    // the same origin, or falls back to root if not.
    const localePrefix = `/${this.currentLocale}`;
    const withoutLocale = path.startsWith(localePrefix)
      ? path.slice(localePrefix.length) || '/'
      : path;

    this.document.location.href = `${origin}/${this.alternateLocale}${withoutLocale}`;
  }
}
