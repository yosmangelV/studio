import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, FormFieldComponent, InputComponent } from 'design-system';
import type { GymProfileResponse, GymProfileUpdate } from '../../../../core/api/gym-profile.service';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, InputComponent, ButtonComponent],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly profile = input<GymProfileResponse | null>(null);
  readonly saving  = input(false);
  readonly saved   = input(false);
  readonly error   = input<string | null>(null);

  readonly save = output<GymProfileUpdate>();

  protected readonly today = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.nonNullable.group({
    phone: ['', Validators.pattern(/^\+?[0-9\s\-()]*$/)],
    whatsapp: ['', Validators.pattern(/^\+?[0-9\s\-()]*$/)],
    email: ['', Validators.email],
    address: ['', Validators.maxLength(200)],
    instagram: ['', Validators.pattern(/^@?[A-Za-z0-9._]{0,30}$/)],
    founded_on: [''],
    active_students_min_display: [20, [Validators.required, Validators.min(1), Validators.max(1000)]],
  });

  constructor() {
    effect(() => {
      const p = this.profile();
      if (!p) return;
      this.form.reset({
        phone: p.phone ?? '',
        whatsapp: p.whatsapp ?? '',
        email: p.email ?? '',
        address: p.address ?? '',
        instagram: p.instagram ?? '',
        founded_on: p.founded_on ?? '',
        active_students_min_display: p.active_students_min_display ?? 20,
      });
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    // Empty strings become null on the server; send them as typed.
    this.save.emit({ ...v, founded_on: v.founded_on || null });
  }
}
