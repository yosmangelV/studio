import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ds-form-field',
  standalone: true,
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  readonly label        = input.required<string>();
  readonly inputId      = input.required<string>();
  readonly hasError     = input<boolean>(false);
  readonly errorMessage = input<string>('');
  readonly hint         = input<string>('');
}
