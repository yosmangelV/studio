import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { PwaInstallBannerComponent } from './shared/components/pwa-install-banner/pwa-install-banner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingComponent, PwaInstallBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  protected readonly isLoading = signal(true);

  ngOnInit(): void {
    // One animation cycle (2.4s) + small buffer
    setTimeout(() => this.isLoading.set(false), 2800);
  }
}
