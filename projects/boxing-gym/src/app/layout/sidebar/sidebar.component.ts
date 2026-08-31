import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BadgeComponent, ButtonComponent } from 'design-system';
import { AuthService } from '../../core/auth/auth.service';
import { InactivityService } from '../../core/auth/inactivity.service';
import { GYM_CONFIG } from '../../core/config/gym-config.token';

interface NavItem {
  label: string;
  route: string;
  disabled?: boolean;
  badge?: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, BadgeComponent, ButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  protected readonly config    = inject(GYM_CONFIG);
  private  readonly auth       = inject(AuthService);
  private  readonly inactivity = inject(InactivityService);
  private  readonly router     = inject(Router);

  readonly open  = input(false);
  readonly close = output<void>();

  private readonly allNavItems: NavItem[] = [
    { label: 'Alumnos', route: '/students' },
    { label: 'Pagos',   route: '/payments', adminOnly: true },
    { label: 'Pedidos', route: '/orders',   disabled: true, badge: 'Pronto' },
    { label: 'Clases',  route: '/classes',  disabled: true, badge: 'Pronto' },
  ];

  protected readonly navItems = computed(() =>
    this.allNavItems.filter(item => !item.adminOnly || this.auth.isAdmin()),
  );

  protected async onSignOut(): Promise<void> {
    this.inactivity.stop();
    await this.auth.signOut();
    await this.router.navigate(['/login']);
  }
}
