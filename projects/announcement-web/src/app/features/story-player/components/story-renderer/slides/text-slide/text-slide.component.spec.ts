import { Type } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { AnnouncementSlide, MessageType } from '../../../../../../core/models/announcement.models';
import { IntroSlideComponent } from '../intro/intro.component';
import { TextSlideComponent } from './text-slide.component';

const slide: AnnouncementSlide = {
  title: 'Gracias por estar',
  body: 'Has cuidado de mi familia.',
  messageType: MessageType.TEXT,
  footer: 'Porque eres muy importante para mí.',
};

const cases: [string, Type<unknown>][] = [
  ['TextSlideComponent', TextSlideComponent],
  ['IntroSlideComponent', IntroSlideComponent],
];

describe.each(cases)('%s', (_name, component) => {
  it('opens with the title as its heading, with no eyebrow above it', async () => {
    const { container } = await render(component, { inputs: { slide } });

    const heading = screen.getByRole('heading', { level: 1, name: 'Gracias por estar' });
    expect(container.firstElementChild?.firstElementChild).toBe(heading);
    expect(container.querySelector('[class*="__eyebrow"]')).toBeNull();
  });

  it('renders the body as a paragraph and the footer as the emphasis line', async () => {
    await render(component, { inputs: { slide } });

    expect(screen.getByText('Has cuidado de mi familia.').tagName).toBe('P');
    expect(screen.getByText('Porque eres muy importante para mí.')).toHaveClass(/__emphasis$/);
  });

  it('omits the parts the slide does not have', async () => {
    const { container } = await render(component, { inputs: { slide: { ...slide, title: '', footer: '' } } });

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="__emphasis"]')).toBeNull();
    expect(screen.getByText('Has cuidado de mi familia.')).toBeInTheDocument();
  });
});
