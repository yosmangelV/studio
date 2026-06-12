import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnnouncementSlide, StoryStatus } from '../../core/models/announcement.models';
import { ProgressDotsComponent } from '../../shared/components/progress-dots/progress-dots.component';
import { StoryNavComponent } from '../../shared/components/story-nav/story-nav.component';
import { StoryService } from './services/story/story.service';
import { SlideRendererComponent } from './components/story-renderer/slide-renderer.component';

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
  private readonly storyService = inject(StoryService);

  readonly currentIndex = signal(0);

  readonly currentSlide = computed<AnnouncementSlide | undefined>(
    () => this.storyService.slides()[this.currentIndex()] ?? undefined,
  );
  readonly isFirst = computed(() => this.currentIndex() === 0);
  readonly isLast = computed(
    () => this.currentIndex() === this.storyService.slides().length - 1,
  );

  readonly status = computed(() => this.storyService.status());
  readonly error = computed(() => this.storyService.error());
  readonly totalSlides = computed<number>(() => this.storyService.slides().length);
  readonly StoryStatus = StoryStatus;
  
  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code') ?? '';
    this.storyService.load(code);
  }

  next(): void {
    if (this.isLast()) {
      this.currentIndex.set(0);
      return;
    }
    if (!this.isLast()) {
      this.currentIndex.update((i) => i + 1);
    }
    
  }

  previous(): void {
    if (!this.isFirst()) {
      this.currentIndex.update((i) => i - 1);
    }
  }
}
