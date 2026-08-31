import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, FormFieldComponent } from 'design-system';
import {
  PaymentCreate,
  PaymentMethod,
  PaymentType,
} from '../../../../core/api/payments.service';
import { StudentResponse } from '../../../../core/api/students.service';

@Component({
  selector: 'app-payment-registration-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, ButtonComponent],
  templateUrl: './payment-registration-form.component.html',
  styleUrl: './payment-registration-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentRegistrationFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly students          = input<StudentResponse[]>([]);
  readonly prefilledStudentId = input<string | null>(null);

  readonly save   = output<PaymentCreate>();
  readonly cancel = output<void>();

  protected readonly paymentTypes: PaymentType[]   = ['monthly_fee', 'material'];
  protected readonly paymentMethods: PaymentMethod[] = ['cash', 'transfer', 'bizum'];

  protected readonly typeLabels: Record<PaymentType, string> = {
    monthly_fee: 'Mensualidad',
    material:    'Material',
  };

  protected readonly methodLabels: Record<PaymentMethod, string> = {
    cash:     'Efectivo',
    transfer: 'Transferencia',
    bizum:    'Bizum',
  };

  protected readonly selectedType = signal<PaymentType>('monthly_fee');
  protected readonly isMonthlyFee = computed(() => this.selectedType() === 'monthly_fee');

  protected readonly defaultPeriod = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })();

  readonly form = this.fb.group({
    student_id:     ['', Validators.required],
    type:           ['monthly_fee' as PaymentType, Validators.required],
    period:         [this.defaultPeriod, Validators.required],
    amount:         [null as number | null, [Validators.required, Validators.min(0.01)]],
    payment_method: ['' as PaymentMethod, Validators.required],
    notes:          [''],
  });

  constructor() {
    effect(() => {
      const prefilled = this.prefilledStudentId();
      if (prefilled) {
        this.form.patchValue({ student_id: prefilled });
      }
    });
  }

  ngOnInit(): void {
    this.form.get('type')!.valueChanges.subscribe(type => {
      const notesControl = this.form.get('notes')!;
      const periodControl = this.form.get('period')!;
      this.selectedType.set(type as PaymentType);

      if (type === 'material') {
        notesControl.setValidators(Validators.required);
        periodControl.clearValidators();
        periodControl.reset();
      } else {
        notesControl.clearValidators();
        notesControl.reset('');
        periodControl.setValidators(Validators.required);
        periodControl.setValue(this.defaultPeriod);
      }
      notesControl.updateValueAndValidity();
      periodControl.updateValueAndValidity();
    });
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const payload: PaymentCreate = {
      student_id:     raw.student_id!,
      type:           raw.type!,
      amount:         raw.amount!,
      payment_method: raw.payment_method!,
      notes:          raw.notes || null,
    };

    if (raw.type === 'monthly_fee' && raw.period) {
      const [year, month] = raw.period.split('-');
      payload.period_year  = Number(year);
      payload.period_month = Number(month);
    }

    this.save.emit(payload);
  }
}
