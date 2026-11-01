import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, FormFieldComponent, InputComponent } from 'design-system';
import type { ClassesUpdate, GymClassResponse } from '../../../../core/api/gym-profile.service';

@Component({
  selector: 'app-classes-editor',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, InputComponent, ButtonComponent],
  templateUrl: './classes-editor.component.html',
  styleUrl: './classes-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassesEditorComponent {
  private readonly fb = inject(FormBuilder);

  readonly classes = input<GymClassResponse[]>([]);
  readonly saving  = input(false);
  readonly saved   = input(false);
  readonly error   = input<string | null>(null);

  readonly save = output<ClassesUpdate>();

  protected readonly rows = this.fb.array<ReturnType<ClassesEditorComponent['classGroup']>>([]);
  protected readonly form = this.fb.group({ rows: this.rows });

  constructor() {
    effect(() => {
      this.rows.clear();
      for (const gymClass of this.classes()) this.rows.push(this.classGroup(gymClass));
    });
  }

  private classGroup(gymClass?: GymClassResponse) {
    return this.fb.nonNullable.group({
      name_es: [gymClass?.name.es ?? '', [Validators.required, Validators.maxLength(60)]],
      name_en: [gymClass?.name.en ?? '', Validators.maxLength(60)],
      description_es: [gymClass?.description.es ?? '', [Validators.required, Validators.maxLength(300)]],
      description_en: [gymClass?.description.en ?? '', Validators.maxLength(300)],
      is_active: [gymClass?.is_active ?? true],
    });
  }

  protected add(): void {
    this.rows.push(this.classGroup());
  }

  protected remove(index: number): void {
    this.rows.removeAt(index);
  }

  protected move(index: number, offset: -1 | 1): void {
    const target = index + offset;
    if (target < 0 || target >= this.rows.length) return;
    const row = this.rows.at(index);
    this.rows.removeAt(index);
    this.rows.insert(target, row);
  }

  protected onSubmit(): void {
    if (this.rows.invalid) {
      this.rows.markAllAsTouched();
      return;
    }
    this.save.emit({
      classes: this.rows.getRawValue().map((row, index) => ({
        name: { es: row.name_es.trim(), en: row.name_en.trim() || null },
        description: { es: row.description_es.trim(), en: row.description_en.trim() || null },
        is_active: row.is_active,
        sort_order: index,
      })),
    });
  }
}
