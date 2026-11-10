import { computed, signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import { AnnouncementSlide, AnnouncementStory, MessageType, StoryStatus } from '../../core/models/announcement.models';
import { StoryService } from './services/story/story.service';
import { StoryPlayerComponent } from './story-player.component';

const textSlide = (body: string): AnnouncementSlide => ({
  title: '',
  body,
  messageType: MessageType.TEXT,
  footer: '',
});

const story: AnnouncementStory = {
  id: 'story-1',
  code: 'TEST-CODE',
  audienceType: 'friends',
  slides: [textSlide('Primera'), textSlide('Segunda'), textSlide('Tercera')],
};

function storyServiceStub(status: StoryStatus) {
  const current = signal<AnnouncementStory | undefined>(story);
  return {
    story: current,
    slides: computed(() => current()?.slides ?? []),
    status: signal(status),
    error: signal<string | undefined>(undefined),
    load: vi.fn(),
  };
}

async function renderPlayer(status = StoryStatus.SUCCESS) {
  return render(StoryPlayerComponent, {
    providers: [
      { provide: StoryService, useValue: storyServiceStub(status) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ code: 'TEST-CODE' }) } } },
    ],
  });
}

const pressKey = (key: string, init: KeyboardEventInit = {}) =>
  fireEvent.keyDown(document, { key, ...init });

describe('StoryPlayerComponent keyboard navigation', () => {
  it('moves to the next slide with the right arrow', async () => {
    await renderPlayer();
    expect(screen.getByText('Primera')).toBeInTheDocument();

    pressKey('ArrowRight');

    expect(await screen.findByText('Segunda')).toBeInTheDocument();
  });

  it('moves back with the left arrow and stays on the first slide', async () => {
    await renderPlayer();

    pressKey('ArrowRight');
    await screen.findByText('Segunda');
    pressKey('ArrowLeft');
    expect(await screen.findByText('Primera')).toBeInTheDocument();

    pressKey('ArrowLeft');
    expect(await screen.findByText('Primera')).toBeInTheDocument();
  });

  it('restarts from the first slide after the last one', async () => {
    await renderPlayer();

    pressKey('ArrowRight');
    pressKey('ArrowRight');
    await screen.findByText('Tercera');
    pressKey('ArrowRight');

    expect(await screen.findByText('Primera')).toBeInTheDocument();
  });

  it('ignores arrows combined with a modifier, so browser shortcuts keep working', async () => {
    await renderPlayer();

    pressKey('ArrowRight', { altKey: true });

    expect(await screen.findByText('Primera')).toBeInTheDocument();
    expect(screen.queryByText('Segunda')).not.toBeInTheDocument();
  });

  it('ignores arrows while the story is still loading', async () => {
    const { fixture } = await renderPlayer(StoryStatus.LOADING);

    pressKey('ArrowRight');

    expect(fixture.componentInstance.currentIndex()).toBe(0);
  });
});
