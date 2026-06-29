import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GYM_CONFIG } from '../../core/config/gym-config.token';
import { HomeNavComponent } from './ui/home-nav/home-nav.component';
import { HeroSectionComponent } from './ui/hero-section/hero-section.component';
import { AboutSectionComponent } from './ui/about-section/about-section.component';
import { ClassesSectionComponent } from './ui/classes-section/classes-section.component';
import { ScheduleSectionComponent } from './ui/schedule-section/schedule-section.component';
import { ContactSectionComponent } from './ui/contact-section/contact-section.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HomeNavComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    ClassesSectionComponent,
    ScheduleSectionComponent,
    ContactSectionComponent,
  ],
  template: `
    <app-home-nav [name]="config.name" [subtitle]="config.subtitle" />
    <main>
      <app-hero-section
        [name]="config.name"
        [subtitle]="config.subtitle"
        [tagline]="config.tagline"
        [logoSrc]="config.assets.logoIllustrated"
      />
      <app-about-section
        [about]="config.about"
        [highlights]="config.highlights"
        [logoSrc]="config.assets.logoMain"
      />
      <app-classes-section [classes]="config.classes" />
      <app-schedule-section [schedule]="config.schedule" />
      <app-contact-section
        [contact]="config.contact"
        [name]="config.name"
        [copyright]="config.copyright"
      />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage {
  protected readonly config = inject(GYM_CONFIG);
}
