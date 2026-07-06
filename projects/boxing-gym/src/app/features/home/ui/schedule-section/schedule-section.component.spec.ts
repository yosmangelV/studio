import { render, screen } from '@testing-library/angular';
import { ScheduleSectionComponent } from './schedule-section.component';

const SCHEDULE = [
  { day: 'Lunes',   time: '18:00 – 20:00' },
  { day: 'Martes',  time: '18:00 – 20:00' },
  { day: 'Domingo', time: 'Cerrado', closed: true },
];

describe('ScheduleSectionComponent', () => {
  it('renders the schedule section', async () => {
    await render(ScheduleSectionComponent, {
      componentInputs: { schedule: SCHEDULE },
    });
    expect(screen.getByTestId('schedule-section')).toBeInTheDocument();
  });

  it('renders all schedule days', async () => {
    await render(ScheduleSectionComponent, {
      componentInputs: { schedule: SCHEDULE },
    });
    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText('Martes')).toBeInTheDocument();
    expect(screen.getByText('Domingo')).toBeInTheDocument();
  });

  it('renders open times', async () => {
    await render(ScheduleSectionComponent, {
      componentInputs: { schedule: SCHEDULE },
    });
    expect(screen.getAllByText('18:00 – 20:00')).toHaveLength(2);
  });
});
