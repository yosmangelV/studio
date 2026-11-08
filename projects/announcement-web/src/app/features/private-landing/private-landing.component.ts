import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Shown on any URL without a message code. It never calls the API, so a visitor without a link sees nothing of what is shared. */
@Component({
  selector: 'app-private-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './private-landing.component.html',
  styleUrl: './private-landing.component.scss',
})
export class PrivateLandingComponent {}
