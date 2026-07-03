import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export interface StripedListItem {
  index: string;
  name: string;
  description: string;
}

@Component({
  selector: 'ds-striped-list',
  standalone: true,
  templateUrl: './striped-list.component.html',
  styleUrl: './striped-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StripedListComponent {
  readonly items = input.required<StripedListItem[]>();
  readonly showArrow = input<boolean>(true);
}
