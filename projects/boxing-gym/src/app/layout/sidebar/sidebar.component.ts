import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from 'design-system';
import { AuthService } from '../../core/auth/auth.service';
import { GYM_CONFIG } from '../../core/config/gym-config.token';

interface NavItem {
  label: string;
  route: string;
  disabled?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  protected readonly config = inject(GYM_CONFIG);
  private  readonly auth   = inject(AuthService);
  private  readonly router = inject(Router);

  readonly open  = input(false);
  readonly close = output<void>();

  protected readonly navItems: NavItem[] = [
    { label: 'Alumnos', route: '/students' },
    { label: 'Pagos',   route: '/payments', disabled: true, badge: 'Pronto' },
    { label: 'Pedidos', route: '/orders',   disabled: true, badge: 'Pronto' },
    { label: 'Clases',  route: '/classes',  disabled: true, badge: 'Pronto' },
  ];

  protected async onSignOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigate(['/login']);
  }
}
