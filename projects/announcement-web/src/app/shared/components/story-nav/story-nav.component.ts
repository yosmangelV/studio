import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ArrowLeft, ArrowRight, LucideAngularModule, RotateCcw } from 'lucide-angular';

@Component({
  selector: 'app-story-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './story-nav.component.html',
  styleUrl: './story-nav.component.scss',
})
export class StoryNavComponent {
  readonly isFirst = input.required<boolean>();
  readonly isLast = input.required<boolean>();

  readonly previous = output<void>();
  readonly next = output<void>();

  protected readonly icons = { previous: ArrowLeft, next: ArrowRight, restart: RotateCcw } as const;
  protected readonly iconSize = 24;

  /** On the last slide "next" restarts the story (design.md, story rules). */
  protected readonly nextIcon = computed(() => (this.isLast() ? this.icons.restart : this.icons.next));
  protected readonly nextLabel = computed(() =>
    this.isLast() ? 'Ver desde el principio' : 'Siguiente diapositiva',
  );
}
