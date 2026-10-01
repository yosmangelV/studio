import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';

const DISMISSED_KEY = 'pwa-install-dismissed';

@Component({
  selector: 'app-pwa-install-banner',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="pwa-banner" role="banner" aria-live="polite">
        <span class="pwa-banner__icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </span>
        <p class="pwa-banner__text">
          Instala la app: toca
          <span class="pwa-banner__share-icon" aria-label="botón Compartir">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </span>
          y luego <strong>«Añadir a pantalla de inicio»</strong>
        </p>
        <button
          class="pwa-banner__close"
          aria-label="Cerrar sugerencia de instalación"
          (click)="dismiss()"
        >✕</button>
      </div>
    }
  `,
  styleUrl: './pwa-install-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PwaInstallBannerComponent implements OnInit {
  protected readonly visible = signal(false);

  ngOnInit(): void {
    if (this.shouldShow()) {
      this.visible.set(true);
    }
  }

  protected dismiss(): void {
    localStorage.setItem(DISMISSED_KEY, '1');
    this.visible.set(false);
  }

  private shouldShow(): boolean {
    if (typeof window === 'undefined') return false;
    if (localStorage.getItem(DISMISSED_KEY)) return false;
    if (window.matchMedia('(display-mode: standalone)').matches) return false;
    const ua = navigator.userAgent;
    return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios/i.test(ua);
  }
}
