import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AnnouncementApiService } from '../../../../core/services/announcement-api.service';
import { AnnouncementSlide, AnnouncementStory, StoryStatus } from '../../../../core/models/announcement.models';

@Injectable({ providedIn: 'root' })
export class StoryService {
  private readonly api = inject(AnnouncementApiService);

  readonly story = signal<AnnouncementStory | undefined>(undefined);
  readonly slides = computed<AnnouncementSlide[]>(() => this.story()?.slides ?? []);
  readonly status = signal<StoryStatus>(StoryStatus.IDLE);
  readonly error = signal<string | undefined>(undefined);

  load(code: string): void {
    this.status.set(StoryStatus.LOADING);
    this.error.set(undefined);

    this.api.getStory(code).subscribe({
      next: (story) => {
        this.story.set(story);
        this.status.set(StoryStatus.SUCCESS);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'No pudimos cargar este mensaje.');
        this.status.set(StoryStatus.ERROR);
      },
    });
  }
}
