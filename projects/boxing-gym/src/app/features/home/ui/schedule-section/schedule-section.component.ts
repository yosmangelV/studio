import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SectionHeaderComponent } from 'design-system';
import type { ScheduleGroup } from '../../../../core/gym-profile/gym-profile.model';

@Component({
  selector: 'app-schedule-section',
  standalone: true,
  imports: [SectionHeaderComponent],
  templateUrl: './schedule-section.component.html',
  styleUrl: './schedule-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleSectionComponent {
  readonly schedule = input.required<ScheduleGroup[]>();
}
