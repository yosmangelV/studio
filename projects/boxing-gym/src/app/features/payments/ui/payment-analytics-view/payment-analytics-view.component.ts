import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PaymentAnalytics } from '../../../../core/api/payments.service';

@Component({
  selector: 'app-payment-analytics-view',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './payment-analytics-view.component.html',
  styleUrl: './payment-analytics-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentAnalyticsViewComponent {
  readonly analytics = input<PaymentAnalytics | null>(null);
  readonly loading   = input(false);

  protected readonly methods = computed(() => {
    const a = this.analytics();
    if (!a) return [];
    return [
      { key: 'cash',     label: 'Efectivo',       data: a.by_method.cash },
      { key: 'transfer', label: 'Transferencia',   data: a.by_method.transfer },
      { key: 'bizum',    label: 'Bizum',            data: a.by_method.bizum },
    ];
  });
}
