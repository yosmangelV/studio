import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  PageNavComponent,
  HeroSectionComponent,
  NavLink,
} from 'design-system';
import { GYM_CONFIG } from '../../core/config/gym-config.token';
import { LocaleSwitcherComponent } from '../../shared/components/locale-switcher/locale-switcher.component';
import { AboutSectionComponent } from './ui/about-section/about-section.component';
import { ClassesSectionComponent } from './ui/classes-section/classes-section.component';
import { ScheduleSectionComponent } from './ui/schedule-section/schedule-section.component';
import { ContactSectionComponent } from './ui/contact-section/contact-section.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    PageNavComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    ClassesSectionComponent,
    ScheduleSectionComponent,
    ContactSectionComponent,
    LocaleSwitcherComponent,
  ],
  template: `
    <ds-page-nav
      [brandName]="config.name"
      [brandSubtitle]="config.subtitle"
      [links]="navLinks"
      (ctaClick)="onNavCtaClick()"
    >
      <app-locale-switcher />
    </ds-page-nav>
    <main>
      <ds-hero-section
        [eyebrow]="config.subtitle"
        [headlineTop]="headlineTop()"
        [headlineMain]="headlineMain()"
        [tagline]="config.tagline"
        primaryCtaLabel="Ver clases" i18n-primaryCtaLabel="@@hero.cta.primary"
        primaryCtaHref="#classes"
        secondaryCtaLabel="Contáctanos" i18n-secondaryCtaLabel="@@hero.cta.secondary"
        secondaryCtaHref="#contact"
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
  private readonly router = inject(Router);

  protected readonly navLinks: NavLink[] = [
    { label: $localize`:@@nav.about:Nosotros`,  href: '#about' },
    { label: $localize`:@@nav.classes:Clases`,  href: '#classes' },
    { label: $localize`:@@nav.schedule:Horarios`, href: '#schedule' },
    { label: $localize`:@@nav.contact:Contacto`, href: '#contact' },
  ];

  protected readonly headlineTop = computed(() => {
    const words = this.config.name.trim().split(/\s+/);
    return words.slice(0, -1).join(' ');
  });

  protected readonly headlineMain = computed(() => {
    const words = this.config.name.trim().split(/\s+/);
    return words[words.length - 1];
  });

  protected onNavCtaClick(): void {
    this.router.navigate(['/login']);
  }
}
