import { render, screen } from '@testing-library/angular';
import { AboutSectionComponent } from './about-section.component';

const HIGHLIGHTS = [
  { value: '10+', label: 'Años de experiencia' },
  { value: '200', label: 'Alumnos activos' },
];

describe('AboutSectionComponent', () => {
  it('renders the about text', async () => {
    await render(AboutSectionComponent, {
      componentInputs: {
        about: 'Somos una escuela de boxeo con trayectoria.',
        highlights: HIGHLIGHTS,
        logoSrc: '/logo.png',
      },
    });
    expect(screen.getByTestId('about-text')).toHaveTextContent('Somos una escuela de boxeo con trayectoria.');
  });

  it('renders all highlight values', async () => {
    await render(AboutSectionComponent, {
      componentInputs: {
        about: 'Descripción.',
        highlights: HIGHLIGHTS,
        logoSrc: '/logo.png',
      },
    });
    expect(screen.getByText('10+')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('renders all highlight labels', async () => {
    await render(AboutSectionComponent, {
      componentInputs: {
        about: 'Descripción.',
        highlights: HIGHLIGHTS,
        logoSrc: '/logo.png',
      },
    });
    expect(screen.getByText('Años de experiencia')).toBeInTheDocument();
    expect(screen.getByText('Alumnos activos')).toBeInTheDocument();
  });
});
