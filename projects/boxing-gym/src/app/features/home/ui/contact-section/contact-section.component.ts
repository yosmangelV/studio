import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SectionHeaderComponent } from 'design-system';
import type { GymContact } from '../../../../core/config/gym-config.model';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [SectionHeaderComponent],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSectionComponent {
  readonly contact = input.required<GymContact>();
  readonly name = input.required<string>();
  readonly copyright = input.required<string>();
}
