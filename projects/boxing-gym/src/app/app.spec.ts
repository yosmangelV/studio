import { render } from '@testing-library/angular';
import { App } from './app';

describe('App', () => {
  it('should render without errors', async () => {
    const { fixture } = await render(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
