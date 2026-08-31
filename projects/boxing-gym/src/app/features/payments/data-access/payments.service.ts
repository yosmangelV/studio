import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, catchError, finalize, tap } from 'rxjs';
import {
  GetPaymentAnalyticsParams,
  GetStudentPaymentsParams,
  ListPaymentsParams,
  PaymentAnalytics,
  PaymentCreate,
  PaymentResponse,
  PaymentSummary,
  PaymentsAPIService,
} from '../../../core/api/payments.service';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly api = inject(PaymentsAPIService);

  readonly summary            = signal<PaymentSummary | null>(null);
  readonly analytics          = signal<PaymentAnalytics | null>(null);
  readonly paymentsList       = signal<PaymentResponse[]>([]);
  readonly paymentsTotal      = signal(0);
  readonly studentPayments    = signal<PaymentResponse[]>([]);
  readonly studentPaymentsTotal = signal(0);
  readonly loading            = signal(false);
  readonly error              = signal<string | null>(null);
  readonly mutationSuccess    = signal(0);

  loadSummary(period?: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getPaymentSummaryPaymentsSummaryGet(period ? { period } : undefined)
      .pipe(
        tap(data => this.summary.set(data)),
        catchError(() => {
          this.error.set('Error al cargar el resumen de pagos.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  loadAnalytics(params?: GetPaymentAnalyticsParams): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getPaymentAnalyticsPaymentsAnalyticsGet(params)
      .pipe(
        tap(data => this.analytics.set(data)),
        catchError(() => {
          this.error.set('Error al cargar las analíticas.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  loadPayments(params?: ListPaymentsParams): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .listPaymentsPaymentsGet(params)
      .pipe(
        tap(res => {
          this.paymentsList.set(res.data ?? []);
          this.paymentsTotal.set(res.total ?? 0);
        }),
        catchError(() => {
          this.error.set('Error al cargar los pagos.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  loadStudentPayments(studentId: string, params?: GetStudentPaymentsParams): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getStudentPaymentsStudentsStudentIdPaymentsGet(studentId, params)
      .pipe(
        tap(res => {
          this.studentPayments.set(res.data ?? []);
          this.studentPaymentsTotal.set(res.total ?? 0);
        }),
        catchError(() => {
          this.error.set('Error al cargar el historial del alumno.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  createPayment(payload: PaymentCreate): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .createPaymentPaymentsPost(payload)
      .pipe(
        tap(() => this.mutationSuccess.update(n => n + 1)),
        catchError(err => {
          if (err?.status === 409) {
            this.error.set('Ya existe un pago de mensualidad para este alumno en ese mes.');
          } else {
            this.error.set('Error al registrar el pago.');
          }
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  deletePayment(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .deletePaymentPaymentsPaymentIdDelete(id)
      .pipe(
        tap(() => this.mutationSuccess.update(n => n + 1)),
        catchError(() => {
          this.error.set('Error al anular el pago.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }
}
