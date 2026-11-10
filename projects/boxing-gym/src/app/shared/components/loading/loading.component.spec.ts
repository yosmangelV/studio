import { render, screen } from '@testing-library/angular';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  it('renders the loading overlay', async () => {
    await render(LoadingComponent);
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });

  it('draws the gloves as hidden SVGs, not emoji (design.md Floor 7)', async () => {
    await render(LoadingComponent);
    const gloves = screen.getAllByTestId('loading-glove');
    expect(gloves).toHaveLength(2);
    gloves.forEach((glove) => {
      expect(glove.tagName.toLowerCase()).toBe('svg');
      expect(glove).toHaveAttribute('aria-hidden', 'true');
    });
    expect(gloves[1]).toHaveClass('loading__glove--mirrored');
    expect(screen.getByTestId('loading-overlay').textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
