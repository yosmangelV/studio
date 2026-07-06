import { render, screen } from '@testing-library/angular';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  it('renders the loading overlay', async () => {
    await render(LoadingComponent);
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });
});
