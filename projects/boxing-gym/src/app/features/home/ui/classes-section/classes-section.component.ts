import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { GymClass } from '../../../../core/config/gym-config.model';

interface NumberedClass extends GymClass {
  num: string;
}

@Component({
  selector: 'app-classes-section',
  standalone: true,
  templateUrl: './classes-section.component.html',
  styleUrl: './classes-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassesSectionComponent {
  readonly classes = input.required<GymClass[]>();

  protected readonly numberedClasses = computed<NumberedClass[]>(() =>
    this.classes().map((cls, i) => ({
      ...cls,
      num: String(i + 1).padStart(2, '0'),
    }))
  );
}
