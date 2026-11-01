import { Injectable, LOCALE_ID, computed, inject, resource } from '@angular/core';
import { SUPABASE_CLIENT } from '../auth/supabase.token';
import type { PublicGymProfile } from './gym-profile.model';
import { groupSchedule, toClassViews, toContactView, toHighlights } from './gym-profile.view';

const CACHE_KEY = 'gym-profile:v1';

function readCache(): PublicGymProfile | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as PublicGymProfile) : null;
  } catch {
    return null;
  }
}

function writeCache(row: PublicGymProfile): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(row));
  } catch {
    // Storage full or blocked: the page still renders from the live response.
  }
}

/**
 * Public gym data for the landing, read straight from Supabase (view `public_gym_profile`)
 * so the page never waits on the API. Renders from the last cached copy first and
 * refreshes in the background.
 */
@Injectable({ providedIn: 'root' })
export class GymProfileService {
  private readonly supabase = inject(SUPABASE_CLIENT);
  private readonly locale = inject(LOCALE_ID);
  private readonly cached = readCache();

  private readonly remote = resource({
    loader: async () => {
      const { data, error } = await this.supabase.from('public_gym_profile').select('*').single();
      if (error) throw error;
      const row = data as PublicGymProfile;
      writeCache(row);
      return row;
    },
  });

  /** Live data once loaded; the cached copy while loading or if Supabase fails. */
  private readonly row = computed<PublicGymProfile | null>(() =>
    this.remote.error() ? this.cached : (this.remote.value() ?? this.cached),
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
