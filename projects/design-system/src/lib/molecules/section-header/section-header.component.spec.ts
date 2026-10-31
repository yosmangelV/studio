import { render, screen } from '@testing-library/angular';
import { SectionHeaderComponent } from './section-header.component';

describe('SectionHeaderComponent', () => {
  it('renders the title as a single heading', async () => {
    await render(SectionHeaderComponent, {
      componentInputs: { title: 'Quiénes somos' },
    });
    expect(screen.getByRole('heading', { name: 'Quiénes somos' })).toBeInTheDocument();
  });

  it('renders as h2 by default', async () => {
    const { container } = await render(SectionHeaderComponent, {
      componentInputs: { title: 'Title' },
    });
    expect(container.querySelector('h2')).toBeInTheDocument();
  });

  it('renders as the specified heading level', async () => {
    const { container } = await render(SectionHeaderComponent, {
      componentInputs: { title: 'Title', level: 'h3' },
    });
    expect(container.querySelector('h3')).toBeInTheDocument();
    expect(container.querySelector('h2')).not.toBeInTheDocument();
  });

  it('applies the center modifier when aligned center', async () => {
    await render(SectionHeaderComponent, {
      componentInputs: { title: 'Title', align: 'center' },
    });
    expect(screen.getByRole('heading')).toHaveClass('section-header__title--center');
  });
});
