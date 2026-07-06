import { render, screen } from '@testing-library/angular';
import { HeroSectionComponent } from './hero-section.component';

const BASE_INPUTS = {
  eyebrow:           'Escuela de Boxeo',
  headlineTop:       'Aprende',
  headlineMain:      'Boxeo',
  tagline:           'Entrena con los mejores',
  primaryCtaLabel:   'Ver clases',
  primaryCtaHref:    '#classes',
  secondaryCtaLabel: 'Contáctanos',
  secondaryCtaHref:  '#contact',
};

describe('HeroSectionComponent', () => {
  it('renders eyebrow text', async () => {
    await render(HeroSectionComponent, { componentInputs: BASE_INPUTS });
    expect(screen.getByText('Escuela de Boxeo')).toBeInTheDocument();
  });

  it('renders headline parts', async () => {
    await render(HeroSectionComponent, { componentInputs: BASE_INPUTS });
    expect(screen.getByText('Aprende')).toBeInTheDocument();
    expect(screen.getByText('Boxeo')).toBeInTheDocument();
  });

  it('renders tagline', async () => {
    await render(HeroSectionComponent, { componentInputs: BASE_INPUTS });
    expect(screen.getByText('Entrena con los mejores')).toBeInTheDocument();
  });

  it('renders primary CTA link with correct href', async () => {
    await render(HeroSectionComponent, { componentInputs: BASE_INPUTS });
    const link = screen.getByRole('link', { name: 'Ver clases' });
    expect(link).toHaveAttribute('href', '#classes');
  });

  it('renders secondary CTA link with correct href', async () => {
    await render(HeroSectionComponent, { componentInputs: BASE_INPUTS });
    const link = screen.getByRole('link', { name: 'Contáctanos' });
    expect(link).toHaveAttribute('href', '#contact');
  });

  it('renders watermark logo when logoSrc is provided', async () => {
    const { container } = await render(HeroSectionComponent, {
      componentInputs: { ...BASE_INPUTS, logoSrc: '/logo.svg' },
    });
    const watermark = container.querySelector('.hero__watermark') as HTMLImageElement;
    expect(watermark).toBeInTheDocument();
    expect(watermark.src).toContain('/logo.svg');
  });

  it('does not render watermark when logoSrc is empty', async () => {
    const { container } = await render(HeroSectionComponent, {
      componentInputs: { ...BASE_INPUTS, logoSrc: '' },
    });
    expect(container.querySelector('.hero__watermark')).not.toBeInTheDocument();
  });
});
