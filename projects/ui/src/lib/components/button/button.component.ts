import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  @HostBinding('class') get hostClass() {
    return 'inline-flex';
  }

  get classes(): string {
    const base = 'btn';
    const variantClass = `btn--${this.variant}`;
    const sizeClass = `btn--${this.size}`;
    const widthClass = this.fullWidth ? 'w-full' : '';
    return [base, variantClass, sizeClass, widthClass].filter(Boolean).join(' ');
  }
}
