import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { BadgeComponent, ButtonComponent, PaginationComponent } from 'design-system';
import { AtRiskStudentInfo, PaidStudentInfo, PaymentSummaryResponse, UnpaidStudentInfo } from '../../../../core/api/payments.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-payment-summary-dashboard',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, CurrencyPipe, DatePipe, PaginationComponent],
  templateUrl: './payment-summary-dashboard.component.html',
  styleUrl: './payment-summary-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSummaryDashboardComponent {
  readonly summary = input<PaymentSummaryResponse | null>(null);
  readonly loading = input(false);

  readonly registerPayment = output<string | null>();
  readonly viewHistory     = output<{ studentId: string; studentName: string }>();

  protected readonly paid    = computed(() => this.summary()?.paid                  ?? []);
  protected readonly pending = computed(() => this.summary()?.pending               ?? []);
  protected readonly overdue = computed(() => this.summary()?.overdue               ?? []);
  protected readonly atRisk  = computed(() => this.summary()?.at_risk_of_inactivity ?? []);

  protected readonly paidPage    = signal(1);
  protected readonly pendingPage = signal(1);
  protected readonly overduePage = signal(1);
  protected readonly atRiskPage  = signal(1);

  protected readonly paidPages    = computed(() => Math.ceil(this.paid().length    / PAGE_SIZE));
  protected readonly pendingPages = computed(() => Math.ceil(this.pending().length / PAGE_SIZE));
  protected readonly overduePages = computed(() => Math.ceil(this.overdue().length / PAGE_SIZE));
  protected readonly atRiskPages  = computed(() => Math.ceil(this.atRisk().length  / PAGE_SIZE));

  protected readonly paidSlice    = computed(() => this.paid()   .slice((this.paidPage()    - 1) * PAGE_SIZE, this.paidPage()    * PAGE_SIZE));
  protected readonly pendingSlice = computed(() => this.pending().slice((this.pendingPage() - 1) * PAGE_SIZE, this.pendingPage() * PAGE_SIZE));
  protected readonly overdueSlice = computed(() => this.overdue().slice((this.overduePage() - 1) * PAGE_SIZE, this.overduePage() * PAGE_SIZE));
  protected readonly atRiskSlice  = computed(() => this.atRisk() .slice((this.atRiskPage()  - 1) * PAGE_SIZE, this.atRiskPage()  * PAGE_SIZE));

  protected onRegister(student: PaidStudentInfo | UnpaidStudentInfo | AtRiskStudentInfo | null): void {
    this.registerPayment.emit(student?.student_id ?? null);
  }

  protected onViewHistory(student: PaidStudentInfo | UnpaidStudentInfo | AtRiskStudentInfo): void {
    this.viewHistory.emit({ studentId: student.student_id, studentName: student.student_name });
  }
}
