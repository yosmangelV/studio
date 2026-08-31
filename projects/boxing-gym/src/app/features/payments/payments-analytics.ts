import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PaymentType } from '../../core/api/payments.service';
import { PaymentsService } from './data-access/payments.service';
import { PaymentAnalyticsViewComponent } from './ui/payment-analytics-view/payment-analytics-view.component';

@Component({
  selector: 'app-payments-analytics',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PaymentAnalyticsViewComponent],
  templateUrl: './payments-analytics.html',
  styleUrl: './payments-analytics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaymentsAnalytics {
  protected readonly service = inject(PaymentsService);

  protected readonly selectedPeriod = signal(this.currentMonthPeriod());
  protected readonly selectedType   = signal<PaymentType | ''>('');

  protected readonly periodLabel = computed(() => {
    const [y, m] = this.selectedPeriod().split('-');
    const date = new Date(+y, +m - 1, 1);
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  });

  protected readonly paymentTypes: Array<{ value: PaymentType | ''; label: string }> = [
    { value: '',            label: 'Todos los tipos' },
    { value: 'monthly_fee', label: 'Mensualidades' },
    { value: 'material',    label: 'Material' },
  ];

  constructor() {
    effect(() => {
      const params = {
        period: this.selectedPeriod(),
        ...(this.selectedType() ? { type: this.selectedType() as PaymentType } : {}),
      };
      this.service.loadAnalytics(params);
    }, { allowSignalWrites: true });
  }

  protected onPeriodChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) this.selectedPeriod.set(value);
  }

  protected onTypeChange(event: Event): void {
    this.selectedType.set((event.target as HTMLSelectElement).value as PaymentType | '');
  }

  private currentMonthPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
