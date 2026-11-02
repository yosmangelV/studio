import { Injectable, LOCALE_ID, computed, inject, resource } from '@angular/core';
import { SUPABASE_CLIENT } from '../auth/supabase.token';
import { readCache, writeCache } from './gym-profile.cache';
import type { PublicGymProfile } from './gym-profile.model';
import { groupSchedule, toClassViews, toContactView, toHighlights } from './gym-profile.view';

/**
 * Public gym data for the landing, read straight from Supabase (view `public_gym_profile`)
 * so the page never waits on the API. Renders from the last cached copy first and
 * refreshes in the background.
 */
@Injectable({ providedIn: 'root' })
export class GymProfileService {
  private readonly supabase = inject(SUPABASE_CLIENT);
  private readonly locale = inject(LOCALE_ID);
  private readonly cached = readCache(localStorage, Date.now());

  /** A previous visit left a copy, so the landing can render without waiting. */
  readonly hasCache = this.cached !== null;

  private readonly remote = resource({
    loader: async () => {
      const { data, error } = await this.supabase.from('public_gym_profile').select('*').single();
      if (error) throw error;
      const row = data as PublicGymProfile;
      writeCache(localStorage, row, Date.now());
      return row;
    },
  });

  /** Live data once loaded; the cached copy while loading or if Supabase fails. */
  private readonly row = computed<PublicGymProfile | null>(() =>
    this.remote.error() ? this.cached : (this.remote.value() ?? this.cached),
  );

  /** True once there is something to render: the cached copy, or the first response or failure. */
  readonly settled = computed(
    () => this.hasCache || this.remote.hasValue() || this.remote.error() !== undefined,
  );

  readonly contact = computed(() => toContactView(this.row()?.profile ?? null));

  readonly schedule = computed(() =>
    this.row() ? groupSchedule(this.row()!.schedule, this.locale, $localize`:@@schedule.closed:Cerrado`) : [],
  );

  readonly classes = computed(() => toClassViews(this.row(), this.locale));

  readonly highlights = computed(() =>
    toHighlights(this.row(), new Date(), {
      activeStudents: $localize`:@@about.highlight.students:Alumnos activos`,
      year: $localize`:@@about.highlight.year:Año formando campeones`,
      years: $localize`:@@about.highlight.years:Años formando campeones`,
      modalities: $localize`:@@about.highlight.modalities:Modalidades de entrenamiento`,
    }),
  );
}
