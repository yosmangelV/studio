import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BadgeComponent, ButtonComponent } from 'design-system';
import { AtRiskStudent, PaymentSummary, PaymentSummaryStudent } from '../../../../core/api/payments.service';

@Component({
  selector: 'app-payment-summary-dashboard',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, CurrencyPipe, DatePipe],
  templateUrl: './payment-summary-dashboard.component.html',
  styleUrl: './payment-summary-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSummaryDashboardComponent {
  readonly summary = input<PaymentSummary | null>(null);
  readonly loading = input(false);

  readonly registerPayment = output<string | null>();
  readonly viewHistory     = output<{ studentId: string; studentName: string }>();

  protected readonly paid     = computed(() => this.summary()?.paid     ?? []);
  protected readonly pending  = computed(() => this.summary()?.pending  ?? []);
  protected readonly overdue  = computed(() => this.summary()?.overdue  ?? []);
  protected readonly atRisk   = computed(() => this.summary()?.at_risk_of_inactivity ?? []);

  protected onRegister(student: PaymentSummaryStudent | AtRiskStudent | null): void {
    this.registerPayment.emit(student?.student_id ?? null);
  }

  protected onViewHistory(student: PaymentSummaryStudent | AtRiskStudent): void {
    this.viewHistory.emit({ studentId: student.student_id, studentName: student.student_name });
  }
}
