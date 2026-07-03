import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SectionHeaderComponent, StripedListComponent, StripedListItem } from 'design-system';
import type { GymClass } from '../../../../core/config/gym-config.model';

@Component({
  selector: 'app-classes-section',
  standalone: true,
  imports: [SectionHeaderComponent, StripedListComponent],
  templateUrl: './classes-section.component.html',
  styleUrl: './classes-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassesSectionComponent {
  readonly classes = input.required<GymClass[]>();

  protected readonly stripedItems = computed<StripedListItem[]>(() =>
    this.classes().map((cls, i) => ({
      index: String(i + 1).padStart(2, '0'),
      name: cls.name,
      description: cls.description,
    }))
  );
}
