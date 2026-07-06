import { render, screen } from '@testing-library/angular';
import { SectionHeaderComponent } from './section-header.component';

describe('SectionHeaderComponent', () => {
  it('renders the eyebrow label', async () => {
    await render(SectionHeaderComponent, {
      componentInputs: { eyebrow: 'Nosotros', title: 'Quiénes somos' },
    });
    expect(screen.getByText('Nosotros')).toBeInTheDocument();
  });

  it('renders the title', async () => {
    await render(SectionHeaderComponent, {
      componentInputs: { eyebrow: 'Nosotros', title: 'Quiénes somos' },
    });
    expect(screen.getByText('Quiénes somos')).toBeInTheDocument();
  });

  it('renders title accent when provided', async () => {
    await render(SectionHeaderComponent, {
      componentInputs: { eyebrow: 'Clases', title: 'Nuestras', titleAccent: 'Clases' },
    });
    expect(screen.getByText('Clases', { selector: '.section-header__accent' })).toBeInTheDocument();
  });

  it('renders as h2 by default', async () => {
    const { container } = await render(SectionHeaderComponent, {
      componentInputs: { eyebrow: 'Label', title: 'Title' },
    });
    expect(container.querySelector('h2')).toBeInTheDocument();
  });

  it('renders as the specified heading level', async () => {
    const { container } = await render(SectionHeaderComponent, {
      componentInputs: { eyebrow: 'Label', title: 'Title', level: 'h3' },
    });
    expect(container.querySelector('h3')).toBeInTheDocument();
    expect(container.querySelector('h2')).not.toBeInTheDocument();
  });
});
