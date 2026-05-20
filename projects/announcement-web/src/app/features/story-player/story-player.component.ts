import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AnnouncementApiService } from '../../core/services/announcement-api.service';
import { AnnouncementSlide, AnnouncementStory, StoryStatus } from '../../core/models/announcement.models';
import { SlideRendererComponent } from '../story-renderer/slide-renderer.component';
import { ProgressDotsComponent } from '../../shared/components/progress-dots/progress-dots.component';
import { StoryNavComponent } from '../../shared/components/story-nav/story-nav.component';

@Component({
  selector: 'app-story-player',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlideRendererComponent, ProgressDotsComponent, StoryNavComponent],
  templateUrl: './story-player.component.html',
  styleUrl: './story-player.component.scss',
})
export class StoryPlayerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AnnouncementApiService);

  readonly story = signal<AnnouncementStory | null>(null);
  readonly status = signal<StoryStatus>('idle');
  readonly currentIndex = signal(0);
  readonly error = signal<string | null>(null);

  readonly currentSlide = computed<AnnouncementSlide | null>(
    () => this.story()?.slides[this.currentIndex()] ?? null,
  );
  readonly isFirst = computed(() => this.currentIndex() === 0);
  readonly isLast = computed(
    () => this.currentIndex() === (this.story()?.slides.length ?? 1) - 1,
  );

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code') ?? '';
    this.loadStory(code);
  }

  next(): void {
    if (!this.isLast()) {
      this.currentIndex.update((i) => i + 1);
    }
  }

  previous(): void {
    if (!this.isFirst()) {
      this.currentIndex.update((i) => i - 1);
    }
  }

  private loadStory(code: string): void {
    this.status.set('loading');
    this.api.getStory(code).subscribe({
      next: (story) => {
        this.story.set(story);
        this.currentIndex.set(0);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'No pudimos cargar este mensaje.');
        this.status.set('error');
      },
    });
  }
}
