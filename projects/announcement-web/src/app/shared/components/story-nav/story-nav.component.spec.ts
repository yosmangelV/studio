import { render, screen } from '@testing-library/angular';
import { StoryNavComponent } from './story-nav.component';

const renderNav = (isFirst: boolean, isLast: boolean) =>
  render(StoryNavComponent, { inputs: { isFirst, isLast } });

describe('StoryNavComponent', () => {
  it('draws its arrows as SVG icons hidden from assistive tech, not as text glyphs', async () => {
    await renderNav(false, false);

    for (const name of ['Diapositiva anterior', 'Siguiente diapositiva']) {
      const button = screen.getByRole('button', { name });
      expect(button.querySelector('svg')).not.toBeNull();
      expect(button.textContent?.trim()).toBe('');
    }
  });

  it('offers a restart on the last slide', async () => {
    await renderNav(false, true);

    expect(screen.getByRole('button', { name: 'Ver desde el principio' })).toBeInTheDocument();
  });

  it('disables previous on the first slide', async () => {
    await renderNav(true, false);

    expect(screen.getByRole('button', { name: 'Diapositiva anterior' })).toBeDisabled();
  });
});
