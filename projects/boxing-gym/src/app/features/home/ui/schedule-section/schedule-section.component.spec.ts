import { render, screen, within } from '@testing-library/angular';
import { ScheduleSectionComponent } from './schedule-section.component';
import type { ScheduleGroup } from '../../../../core/gym-profile/gym-profile.model';

const SCHEDULE: ScheduleGroup[] = [
  {
    days: 'Lunes – Viernes',
    closed: false,
    sessions: [
      { label: 'Juniors', time: '17:30 – 18:30' },
      { label: 'Adultos', time: '18:30 – 19:30' },
    ],
  },
  { days: 'Sábado – Domingo', closed: true, sessions: [{ label: null, time: 'Cerrado' }] },
];

describe('ScheduleSectionComponent', () => {
  it('renders one row per day range', async () => {
    await render(ScheduleSectionComponent, { componentInputs: { schedule: SCHEDULE } });
    const rows = screen.getAllByTestId('schedule-group');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('Lunes – Viernes')).toBeInTheDocument();
  });

  it('renders each session with its group label', async () => {
    await render(ScheduleSectionComponent, { componentInputs: { schedule: SCHEDULE } });
    expect(screen.getByText('Juniors')).toBeInTheDocument();
    expect(screen.getByText('17:30 – 18:30')).toBeInTheDocument();
    expect(screen.getByText('18:30 – 19:30')).toBeInTheDocument();
  });

  it('marks closed days', async () => {
    await render(ScheduleSectionComponent, { componentInputs: { schedule: SCHEDULE } });
    expect(screen.getAllByTestId('schedule-group')[1]).toHaveClass('schedule__row--closed');
    expect(screen.getByText('Cerrado')).toBeInTheDocument();
  });
});
