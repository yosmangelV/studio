import type { Meta, StoryObj } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { FormFieldComponent } from './form-field.component';
import { InputComponent } from '../../atoms/input/input.component';

const meta: Meta<FormFieldComponent> = {
  title: 'Molecules/FormField',
  component: FormFieldComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FormFieldComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <ds-form-field label="Email" inputId="s-email" style="max-width:320px">
        <ds-input inputId="s-email" type="email" placeholder="tu@email.com" autocomplete="email" />
      </ds-form-field>
    `,
    imports: [FormFieldComponent, InputComponent],
  }),
};

export const WithHint: Story = {
  render: () => ({
    template: `
      <ds-form-field label="Contraseña" inputId="s-pw" hint="Mínimo 6 caracteres" style="max-width:320px">
        <ds-input inputId="s-pw" type="password" placeholder="••••••••" autocomplete="new-password" />
      </ds-form-field>
    `,
    imports: [FormFieldComponent, InputComponent],
  }),
};

export const WithError: Story = {
  render: () => ({
    template: `
      <ds-form-field label="Email" inputId="s-email-err" [hasError]="true" errorMessage="Introduce un email válido" style="max-width:320px">
        <ds-input inputId="s-email-err" type="email" placeholder="tu@email.com" [hasError]="true" />
      </ds-form-field>
    `,
    imports: [FormFieldComponent, InputComponent],
  }),
};

@Component({
  selector: 'story-login-form',
  standalone: true,
  imports: [FormFieldComponent, InputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate
      style="display:flex;flex-direction:column;gap:20px;max-width:320px">
      <ds-form-field label="Email" inputId="sf-email"
        [hasError]="emailInvalid()" errorMessage="Introduce un email válido">
        <ds-input inputId="sf-email" type="email" placeholder="tu@email.com"
          autocomplete="email" formControlName="email" [hasError]="emailInvalid()" />
      </ds-form-field>
      <ds-form-field label="Contraseña" inputId="sf-pw"
        [hasError]="passwordInvalid()" errorMessage="Mínimo 6 caracteres" hint="Mínimo 6 caracteres">
        <ds-input inputId="sf-pw" type="password" placeholder="••••••••"
          autocomplete="current-password" formControlName="password" [hasError]="passwordInvalid()" />
      </ds-form-field>
      <button type="submit" style="padding:8px 16px">Enviar</button>
    </form>
  `,
})
class LoginFormStory {
  readonly form = new FormControl({}) as unknown as ReturnType<typeof this._buildForm>;
  private _buildForm() {
    return {
      controls: {
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      },
      markAllAsTouched: () => {},
    };
  }

  readonly emailInvalid    = signal(false);
  readonly passwordInvalid = signal(false);

  submit() {
    this.emailInvalid.set(true);
    this.passwordInvalid.set(true);
  }
}

// Simpler reactive form story without the class complexity
export const ReactiveFormIntegration: Story = {
  render: () => ({
    template: `<story-reactive-ff />`,
    imports: [ReactiveFormStoryComponent],
  }),
};

@Component({
  selector: 'story-reactive-ff',
  standalone: true,
  imports: [FormFieldComponent, InputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate
      style="display:flex;flex-direction:column;gap:20px;max-width:320px">
      <ds-form-field label="Email" inputId="rf-email"
        [hasError]="emailInvalid" errorMessage="Introduce un email válido">
        <ds-input inputId="rf-email" type="email" placeholder="tu@email.com"
          autocomplete="email" formControlName="email" [hasError]="emailInvalid" />
      </ds-form-field>
      <ds-form-field label="Contraseña" inputId="rf-pw"
        [hasError]="passwordInvalid" errorMessage="Mínimo 6 caracteres" hint="Mínimo 6 caracteres">
        <ds-input inputId="rf-pw" type="password" placeholder="••••••••"
          autocomplete="current-password" formControlName="password" [hasError]="passwordInvalid" />
      </ds-form-field>
      <button type="submit" style="padding:8px 16px;cursor:pointer">Enviar (prueba errores)</button>
      <p style="font-size:0.75rem;color:#64748b">Email: {{ form.value.email }}</p>
    </form>
  `,
})
class ReactiveFormStoryComponent {
  form = new (class {
    controls = {
      email:    new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    };
    value = { email: '' };
    markAllAsTouched() {
      Object.values(this.controls).forEach(c => c.markAsTouched());
    }
  })();

  get emailInvalid()    { return this.form.controls.email.touched    && this.form.controls.email.invalid; }
  get passwordInvalid() { return this.form.controls.password.touched && this.form.controls.password.invalid; }

  submit() { this.form.markAllAsTouched(); }
}
