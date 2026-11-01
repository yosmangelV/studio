import { render, screen } from '@testing-library/angular';
import { ClassesSectionComponent } from './classes-section.component';

const CLASSES = [
  { name: 'Boxeo', description: 'Técnica y condición física' },
  { name: 'Kickboxing', description: 'Golpes y patadas' },
];

describe('ClassesSectionComponent', () => {
  it('renders all class names', async () => {
    await render(ClassesSectionComponent, {
      componentInputs: { classes: CLASSES },
    });
    expect(screen.getByText('Boxeo')).toBeInTheDocument();
    expect(screen.getByText('Kickboxing')).toBeInTheDocument();
  });

  it('renders all class descriptions', async () => {
    await render(ClassesSectionComponent, {
      componentInputs: { classes: CLASSES },
    });
    expect(screen.getByText('Técnica y condición física')).toBeInTheDocument();
    expect(screen.getByText('Golpes y patadas')).toBeInTheDocument();
  });
});
