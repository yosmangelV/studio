import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-nav.component.html',
  styleUrl: './home-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavComponent {
  readonly name = input.required<string>();
  readonly subtitle = input.required<string>();
}
