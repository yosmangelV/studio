import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-story-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './story-nav.component.html',
  styleUrl: './story-nav.component.scss',
})
export class StoryNavComponent {
  readonly isFirst = input.required<boolean>();
  readonly isLast = input.required<boolean>();

  readonly previous = output<void>();
  readonly next = output<void>();
}
