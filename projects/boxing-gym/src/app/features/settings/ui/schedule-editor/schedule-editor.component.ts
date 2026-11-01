import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, FormFieldComponent, InputComponent } from 'design-system';
import type { ScheduleSlotResponse, ScheduleUpdate } from '../../../../core/api/gym-profile.service';

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7].map((day) => {
  const name = new Intl.DateTimeFormat('es', { weekday: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2024, 0, day))); // 2024-01-01 was a Monday
  return { value: day, label: name.charAt(0).toUpperCase() + name.slice(1) };
});

@Component({
  selector: 'app-schedule-editor',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, InputComponent, ButtonComponent],
  templateUrl: './schedule-editor.component.html',
  styleUrl: './schedule-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleEditorComponent {
  private readonly fb = inject(FormBuilder);

  readonly slots  = input<ScheduleSlotResponse[]>([]);
  readonly saving = input(false);
  readonly saved  = input(false);
  readonly error  = input<string | null>(null);

  readonly save = output<ScheduleUpdate>();

  protected readonly weekdays = WEEKDAYS;
  protected readonly rows = this.fb.array<ReturnType<ScheduleEditorComponent['slotGroup']>>([]);
  protected readonly form = this.fb.group({ rows: this.rows });

  constructor() {
    effect(() => {
      this.rows.clear();
      for (const slot of this.slots()) this.rows.push(this.slotGroup(slot));
    });
  }

  private slotGroup(slot?: ScheduleSlotResponse) {
    return this.fb.nonNullable.group({
      day_from: [slot?.day_from ?? 1, Validators.required],
      day_to: [slot?.day_to ?? 5, Validators.required],
      opens_at: [slot?.opens_at.slice(0, 5) ?? '18:00', Validators.required],
      closes_at: [slot?.closes_at.slice(0, 5) ?? '19:00', Validators.required],
      label_es: [slot?.label?.es ?? '', Validators.maxLength(60)],
      label_en: [slot?.label?.en ?? '', Validators.maxLength(60)],
    });
  }

  protected add(): void {
    this.rows.push(this.slotGroup());
  }

  protected remove(index: number): void {
    this.rows.removeAt(index);
  }

  protected onSubmit(): void {
    if (this.rows.invalid) {
      this.rows.markAllAsTouched();
      return;
    }
    this.save.emit({
      slots: this.rows.getRawValue().map((row, index) => ({
        day_from: Number(row.day_from),
        day_to: Number(row.day_to),
        opens_at: row.opens_at,
        closes_at: row.closes_at,
        label: row.label_es.trim() ? { es: row.label_es.trim(), en: row.label_en.trim() || null } : null,
        sort_order: index,
      })),
    });
  }
}
