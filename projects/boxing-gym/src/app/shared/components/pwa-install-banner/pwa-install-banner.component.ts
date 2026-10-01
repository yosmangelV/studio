import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

const DISMISSED_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type BannerMode = 'ios' | 'android';

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

        @if (mode() === 'ios') {
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
        } @else {
          <p class="pwa-banner__text">Instala la app en tu dispositivo</p>
          <button class="pwa-banner__install" (click)="installAndroid()">Instalar</button>
        }

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
export class PwaInstallBannerComponent implements OnInit, OnDestroy {
  protected readonly visible = signal(false);
  protected readonly mode = signal<BannerMode>('ios');

  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  private readonly beforeInstallHandler = (e: Event): void => {
    e.preventDefault();
    this.deferredPrompt = e as BeforeInstallPromptEvent;
    if (!localStorage.getItem(DISMISSED_KEY)) {
      this.mode.set('android');
      this.visible.set(true);
    }
  };

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // iOS: Safari, Chrome iOS (CriOS), and other iOS browsers all use WebKit
    // and share the same "Share → Add to Home Screen" flow
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      this.mode.set('ios');
      this.visible.set(true);
      return;
    }

    // Android Chrome and other Chromium browsers fire beforeinstallprompt
    window.addEventListener('beforeinstallprompt', this.beforeInstallHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeinstallprompt', this.beforeInstallHandler);
  }

  protected async installAndroid(): Promise<void> {
    if (!this.deferredPrompt) return;
    await this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      this.dismiss();
    }
    this.deferredPrompt = null;
  }

  protected dismiss(): void {
    localStorage.setItem(DISMISSED_KEY, '1');
    this.visible.set(false);
  }
}
