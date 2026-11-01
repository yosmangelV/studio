import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ScheduleEditorComponent } from './schedule-editor.component';
import type { ScheduleSlotResponse, ScheduleUpdate } from '../../../../core/api/gym-profile.service';

const SLOTS: ScheduleSlotResponse[] = [
  { id: 'a', day_from: 1, day_to: 5, opens_at: '17:30:00', closes_at: '18:30:00', label: { es: 'Juniors', en: 'Juniors' }, sort_order: 0 },
  { id: 'b', day_from: 2, day_to: 4, opens_at: '11:00:00', closes_at: '12:00:00', label: null, sort_order: 1 },
];

async function setup(slots: ScheduleSlotResponse[] = SLOTS) {
  const save = vi.fn<(payload: ScheduleUpdate) => void>();
  await render(ScheduleEditorComponent, { inputs: { slots }, on: { save } });
  return { save, user: userEvent.setup() };
}

describe('ScheduleEditorComponent', () => {
  it('renders one row per slot', async () => {
    await setup();
    expect(screen.getAllByTestId('settings-schedule-row')).toHaveLength(2);
  });

  it('emits slots in list order with HH:MM times and null for an empty group', async () => {
    const { save, user } = await setup();
    await user.click(screen.getByTestId('settings-schedule-save').querySelector('button')!);
    expect(save).toHaveBeenCalledWith({
      slots: [
        { day_from: 1, day_to: 5, opens_at: '17:30', closes_at: '18:30', label: { es: 'Juniors', en: 'Juniors' }, sort_order: 0 },
        { day_from: 2, day_to: 4, opens_at: '11:00', closes_at: '12:00', label: null, sort_order: 1 },
      ],
    });
  });

  it('adds and removes sessions', async () => {
    const { save, user } = await setup();
    await user.click(screen.getByTestId('settings-schedule-add').querySelector('button')!);
    expect(screen.getAllByTestId('settings-schedule-row')).toHaveLength(3);
    await user.click(screen.getAllByTestId('settings-schedule-remove')[0].querySelector('button')!);
    await user.click(screen.getByTestId('settings-schedule-save').querySelector('button')!);
    expect(save.mock.calls[0][0].slots.map((s) => s.opens_at)).toEqual(['11:00', '18:00']);
  });

  it('allows saving an empty schedule (every day closed)', async () => {
    const { save, user } = await setup([]);
    expect(screen.getByText(/todos los días como cerrados/)).toBeInTheDocument();
    await user.click(screen.getByTestId('settings-schedule-save').querySelector('button')!);
    expect(save).toHaveBeenCalledWith({ slots: [] });
  });
});
