import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PaymentType } from '../../core/api/payments.service';
import { PaymentsService } from './data-access/payments.service';
import { currentPeriod, periodLabelFromKey } from './utils/period';
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

  protected readonly selectedPeriod = signal(currentPeriod());
  protected readonly selectedType   = signal<PaymentType | ''>('');

  protected readonly periodLabel = computed(() => periodLabelFromKey(this.selectedPeriod()));

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

}
