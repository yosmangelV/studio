import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from 'design-system';
import { PaymentMethod, PaymentResponse, PaymentType } from '../../../../core/api/payments.service';

const PAGE_SIZE = 20;

interface DisplayPayment extends PaymentResponse {
  periodLabel: string;
}

@Component({
  selector: 'app-student-payment-history',
  standalone: true,
  imports: [ButtonComponent, CurrencyPipe, DatePipe],
  templateUrl: './student-payment-history.component.html',
  styleUrl: './student-payment-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentPaymentHistoryComponent {
  readonly payments      = input<PaymentResponse[]>([]);
  readonly total         = input(0);
  readonly loading       = input(false);
  readonly studentName   = input('');
  readonly currentOffset = input(0);

  readonly loadMore      = output<{ limit: number; offset: number }>();
  readonly deletePayment = output<string>();
  readonly close         = output<void>();

  protected readonly displayPayments = computed<DisplayPayment[]>(() =>
    this.payments().map(p => ({ ...p, periodLabel: this.toPeriodLabel(p) })),
  );

  protected readonly hasMore = computed(
    () => this.currentOffset() + PAGE_SIZE < this.total(),
  );

  protected readonly typeLabels: Record<PaymentType, string> = {
    monthly_fee: 'Mensualidad',
    material:    'Material',
  };

  protected readonly methodLabels: Record<PaymentMethod, string> = {
    cash:     'Efectivo',
    transfer: 'Transferencia',
    bizum:    'Bizum',
  };

  private toPeriodLabel(payment: PaymentResponse): string {
    if (payment.type !== 'monthly_fee' || !payment.period_year || !payment.period_month) {
      return '—';
    }
    const date = new Date(payment.period_year, payment.period_month - 1, 1);
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  }

  protected onLoadMore(): void {
    this.loadMore.emit({ limit: PAGE_SIZE, offset: this.currentOffset() + PAGE_SIZE });
  }

  protected onDelete(id: string): void {
    if (!confirm('¿Anular este pago? El alumno volverá a aparecer como sin pagar en ese mes.')) {
      return;
    }
    this.deletePayment.emit(id);
  }
}
