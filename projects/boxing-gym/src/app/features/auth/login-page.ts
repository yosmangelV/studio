import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { ButtonComponent, FormFieldComponent, InputComponent } from 'design-system';
import { GYM_CONFIG } from '../../core/config/gym-config.token';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FormFieldComponent, InputComponent],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPage {
  protected readonly config = inject(GYM_CONFIG);
  private  readonly auth   = inject(AuthService);
  private  readonly fb     = inject(FormBuilder);
  private  readonly router  = inject(Router);

  protected readonly headlineTop  = this.config.name.trim().split(/\s+/).slice(0, -1).join(' ');
  protected readonly headlineMain = this.config.name.trim().split(/\s+/).at(-1) ?? '';

  protected readonly form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly loading     = signal(false);
  protected readonly error       = signal<string | null>(null);
  protected readonly submitLabel = computed(() => this.loading() ? 'Entrando…' : 'Iniciar sesión');

  private readonly formStatus = toSignal(
    this.form.statusChanges.pipe(startWith(this.form.status))
  );

  protected readonly emailInvalid = computed(() => {
    this.formStatus();
    return this.form.controls.email.touched && this.form.controls.email.invalid;
  });

  protected readonly passwordInvalid = computed(() => {
    this.formStatus();
    return this.form.controls.password.touched && this.form.controls.password.invalid;
  });

  protected async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.auth.signIn(this.form.value.email!, this.form.value.password!);
      await this.router.navigate(['/students']);
    } catch {
      this.error.set('Credenciales incorrectas. Inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
}
