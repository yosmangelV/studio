import type { Meta, StoryObj } from '@storybook/angular';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { InputComponent } from './input.component';

const meta: Meta<InputComponent> = {
  title: 'Atoms/Input',
  component: InputComponent,
  tags: ['autodocs'],
  args: {
    inputId: 'demo-input',
    type: 'text',
    placeholder: 'Escribe algo...',
    autocomplete: 'off',
    hasError: false,
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
  },
};

export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: { placeholder: 'tu@email.com', type: 'email' },
};

export const Invalid: Story = {
  args: { hasError: true, placeholder: 'Valor inválido' },
};

export const Password: Story = {
  args: { type: 'password', placeholder: '••••••••', autocomplete: 'current-password' },
};

export const Disabled: Story = {
  args: { placeholder: 'Campo deshabilitado' },
  render: (args) => ({
    props: args,
    template: `<ds-input [inputId]="inputId" [type]="type" [placeholder]="placeholder" [disabled]="true" />`,
  }),
};

// Shows the component working inside a reactive form
@Component({
  selector: 'story-reactive-form',
  standalone: true,
  imports: [InputComponent, ReactiveFormsModule],
  template: `
    <form style="display:flex;flex-direction:column;gap:8px;max-width:320px">
      <ds-input inputId="email" type="email" placeholder="tu@email.com" autocomplete="email" [formControl]="ctrl" />
      <p style="font-size:0.75rem;color:#64748b">Valor: {{ ctrl.value }}</p>
    </form>
  `,
})
class ReactiveFormStory {
  ctrl = new FormControl('');
}

export const WithReactiveForm: Story = {
  render: (_args) => ({
    template: `<story-reactive-form></story-reactive-form>`,
    moduleMetadata: { imports: [ReactiveFormStory] },
  }),
};

export const AllVariants: Story = {
  render: (_args) => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;max-width:320px">
        <ds-input inputId="v1" placeholder="Default" />
        <ds-input inputId="v2" placeholder="Con error" [hasError]="true" />
        <ds-input inputId="v3" type="password" placeholder="Password" />
        <ds-input inputId="v4" placeholder="Disabled" [disabled]="true" />
      </div>
    `,
  }),
};
