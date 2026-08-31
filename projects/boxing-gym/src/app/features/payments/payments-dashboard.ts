import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from 'design-system';
import { PaymentCreate } from '../../core/api/payments.service';
import { StudentsService } from '../students/data-access/students.service';
import { PaymentsService } from './data-access/payments.service';
import { PaymentRegistrationFormComponent } from './ui/payment-registration-form/payment-registration-form.component';
import { PaymentSummaryDashboardComponent } from './ui/payment-summary-dashboard/payment-summary-dashboard.component';
import { StudentPaymentHistoryComponent } from './ui/student-payment-history/student-payment-history.component';

type DashboardMode = 'summary' | 'form' | 'history';

@Component({
  selector: 'app-payments-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    ButtonComponent,
    PaymentSummaryDashboardComponent,
    PaymentRegistrationFormComponent,
    StudentPaymentHistoryComponent,
  ],
  templateUrl: './payments-dashboard.html',
  styleUrl: './payments-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaymentsDashboard {
  protected readonly paymentsService = inject(PaymentsService);
  protected readonly studentsService = inject(StudentsService);

  protected readonly mode               = signal<DashboardMode>('summary');
  protected readonly selectedStudentId  = signal<string | null>(null);
  protected readonly selectedStudentName = signal('');
  protected readonly prefilledStudentId = signal<string | null>(null);
  protected readonly historyOffset      = signal(0);

  protected readonly selectedPeriod = signal(this.currentMonthPeriod());

  protected readonly periodLabel = computed(() => {
    const [y, m] = this.selectedPeriod().split('-');
    const date = new Date(+y, +m - 1, 1);
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  });

  constructor() {
    effect(() => {
      this.paymentsService.loadSummary(this.selectedPeriod());
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.paymentsService.mutationSuccess() > 0) {
        this.paymentsService.loadSummary(this.selectedPeriod());
        const currentMode      = untracked(() => this.mode());
        const currentStudentId = untracked(() => this.selectedStudentId());
        if (currentMode === 'form') {
          this.mode.set('summary');
          this.prefilledStudentId.set(null);
        }
        if (currentMode === 'history' && currentStudentId) {
          this.historyOffset.set(0);
          this.paymentsService.loadStudentPayments(currentStudentId);
        }
      }
    }, { allowSignalWrites: true });
  }

  protected onPeriodChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) this.selectedPeriod.set(value);
  }

  protected onShowForm(studentId: string | null = null): void {
    this.studentsService.loadAll();
    this.prefilledStudentId.set(studentId);
    this.mode.set('form');
  }

  protected onViewHistory(info: { studentId: string; studentName: string }): void {
    this.selectedStudentId.set(info.studentId);
    this.selectedStudentName.set(info.studentName);
    this.historyOffset.set(0);
    this.paymentsService.loadStudentPayments(info.studentId, { limit: 20, offset: 0 });
    this.mode.set('history');
  }

  protected onSave(payload: PaymentCreate): void {
    this.paymentsService.createPayment(payload);
  }

  protected onCancel(): void {
    this.mode.set('summary');
    this.prefilledStudentId.set(null);
  }

  protected onCloseHistory(): void {
    this.mode.set('summary');
    this.selectedStudentId.set(null);
    this.selectedStudentName.set('');
  }

  protected onLoadMore(params: { limit: number; offset: number }): void {
    this.historyOffset.set(params.offset);
    this.paymentsService.loadStudentPayments(this.selectedStudentId()!, params);
  }

  protected onDeletePayment(id: string): void {
    this.paymentsService.deletePayment(id);
  }

  private currentMonthPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
