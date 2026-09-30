import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'ds-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly pages = input.required<number>();
  readonly total = input<number>(0);

  readonly pageChange = output<number>();

  readonly pageNumbers = computed(() => {
    const current = this.currentPage();
    const total = this.pages();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const items: (number | null)[] = [];
    items.push(1);

    if (current > 3) items.push(null);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) items.push(i);

    if (current < total - 2) items.push(null);

    items.push(total);
    return items;
  });

  go(page: number): void {
    if (page < 1 || page > this.pages() || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }
}
