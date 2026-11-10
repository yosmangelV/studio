import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormFieldComponent } from './form-field.component';
import { InputComponent } from '../../atoms/input/input.component';

const meta: Meta<FormFieldComponent> = {
  title: 'Molecules/FormField',
  component: FormFieldComponent,
  tags: ['autodocs'],
  // render() templates compose ds-input; Storybook ignores an `imports` field there.
  decorators: [moduleMetadata({ imports: [InputComponent] })],
};

export default meta;
type Story = StoryObj<FormFieldComponent>;

export const Default: Story = {
  render: (_args) => ({
    template: `
      <ds-form-field label="Email" inputId="s-email" style="max-width:320px">
        <ds-input inputId="s-email" type="email" placeholder="tu@email.com" autocomplete="email" />
      </ds-form-field>
    `,
  }),
};

export const WithHint: Story = {
  render: (_args) => ({
    template: `
      <ds-form-field label="Contraseña" inputId="s-pw" hint="Mínimo 6 caracteres" style="max-width:320px">
        <ds-input inputId="s-pw" type="password" placeholder="••••••••" autocomplete="new-password" />
      </ds-form-field>
    `,
  }),
};

export const WithError: Story = {
  render: (_args) => ({
    template: `
      <ds-form-field label="Email" inputId="s-email-err" [hasError]="true" errorMessage="Introduce un email válido" style="max-width:320px">
        <ds-input inputId="s-email-err" type="email" placeholder="tu@email.com" [hasError]="true" />
      </ds-form-field>
    `,
  }),
};

@Component({
  selector: 'story-reactive-ff',
  standalone: true,
  imports: [FormFieldComponent, InputComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submitted.set(true)" novalidate
      style="display:flex;flex-direction:column;gap:20px;max-width:320px">
      <ds-form-field label="Email" inputId="rf-email"
        [hasError]="submitted() && form.controls.email.invalid" errorMessage="Introduce un email válido">
        <ds-input inputId="rf-email" type="email" placeholder="tu@email.com"
          autocomplete="email" formControlName="email" [hasError]="submitted() && form.controls.email.invalid" />
      </ds-form-field>
      <ds-form-field label="Contraseña" inputId="rf-pw"
        [hasError]="submitted() && form.controls.password.invalid" errorMessage="Mínimo 6 caracteres" hint="Mínimo 6 caracteres">
        <ds-input inputId="rf-pw" type="password" placeholder="••••••••"
          autocomplete="current-password" formControlName="password" [hasError]="submitted() && form.controls.password.invalid" />
      </ds-form-field>
      <button type="submit" style="min-height:44px;cursor:pointer">Enviar (prueba errores)</button>
    </form>
  `,
})
class ReactiveFormStoryComponent {
  protected readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  protected readonly submitted = signal(false);
}

export const ReactiveFormIntegration: Story = {
  decorators: [moduleMetadata({ imports: [ReactiveFormStoryComponent] })],
  render: () => ({ template: `<story-reactive-ff />` }),
};
