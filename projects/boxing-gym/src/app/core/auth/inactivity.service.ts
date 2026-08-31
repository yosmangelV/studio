import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class InactivityService {
  private readonly TIMEOUT_MS = 10 * 60 * 1000;
  private readonly auth       = inject(AuthService);
  private readonly router     = inject(Router);

  private timer: ReturnType<typeof setTimeout> | null = null;
  private listenersAttached = false;
  private readonly boundReset = () => this.resetTimer();

  start(): void {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > this.TIMEOUT_MS) {
        this.signOut();
        return;
      }
    }

    this.resetTimer();

    if (!this.listenersAttached) {
      ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(event =>
        window.addEventListener(event, this.boundReset, { passive: true }),
      );
      this.listenersAttached = true;
    }
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.listenersAttached) {
      ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(event =>
        window.removeEventListener(event, this.boundReset),
      );
      this.listenersAttached = false;
    }

    localStorage.removeItem('lastActivity');
  }

  private resetTimer(): void {
    localStorage.setItem('lastActivity', Date.now().toString());
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.signOut(), this.TIMEOUT_MS);
  }

  private async signOut(): Promise<void> {
    this.stop();
    await this.auth.signOut();
    await this.router.navigate(['/login']);
  }
}
