import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from 'design-system';
import { AuthService } from '../../core/auth/auth.service';
import { InactivityService } from '../../core/auth/inactivity.service';
import { GYM_CONFIG } from '../../core/config/gym-config.token';

// Only screens that exist: no "coming soon" entries (root design.md, Floor 3).
interface NavItem {
  label: string;
  route: string;
  adminOnly?: boolean;
  staffOnly?: boolean;
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
  protected readonly config    = inject(GYM_CONFIG);
  private  readonly auth       = inject(AuthService);
  private  readonly inactivity = inject(InactivityService);
  private  readonly router     = inject(Router);

  readonly open  = input(false);
  readonly close = output<void>();

  private readonly allNavItems: NavItem[] = [
    { label: 'Alumnos', route: '/students', staffOnly: true },
    { label: 'Pagos',   route: '/payments', adminOnly: true },
    { label: 'Datos del gimnasio', route: '/settings', adminOnly: true },
  ];

  protected readonly navItems = computed(() =>
    this.allNavItems.filter(item =>
      (!item.adminOnly || this.auth.isAdmin()) && (!item.staffOnly || this.auth.isStaff()),
    ),
  );

  protected async onSignOut(): Promise<void> {
    this.inactivity.stop();
    await this.auth.signOut();
    await this.router.navigate(['/login']);
  }
}
