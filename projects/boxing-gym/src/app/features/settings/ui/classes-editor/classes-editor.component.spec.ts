import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ClassesEditorComponent } from './classes-editor.component';
import type { ClassesUpdate, GymClassResponse } from '../../../../core/api/gym-profile.service';

const CLASSES: GymClassResponse[] = [
  { id: '1', name: { es: 'Boxeo', en: 'Boxing' }, description: { es: 'Técnica', en: null }, sort_order: 0, is_active: true },
  { id: '2', name: { es: 'Juniors', en: null }, description: { es: 'Para los pequeños', en: null }, sort_order: 1, is_active: true },
];

async function setup() {
  const save = vi.fn<(payload: ClassesUpdate) => void>();
  await render(ClassesEditorComponent, { inputs: { classes: CLASSES }, on: { save } });
  return { save, user: userEvent.setup() };
}

const button = (testId: string) => screen.getByTestId(testId).querySelector('button')!;

describe('ClassesEditorComponent', () => {
  it('emits classes with empty translations as null and order as sort_order', async () => {
    const { save, user } = await setup();
    await user.click(button('settings-classes-save'));
    expect(save).toHaveBeenCalledWith({
      classes: [
        { name: { es: 'Boxeo', en: 'Boxing' }, description: { es: 'Técnica', en: null }, is_active: true, sort_order: 0 },
        { name: { es: 'Juniors', en: null }, description: { es: 'Para los pequeños', en: null }, is_active: true, sort_order: 1 },
      ],
    });
  });

  it('reorders with Subir and saves the new order', async () => {
    const { save, user } = await setup();
    const [, second] = screen.getAllByRole('button', { name: 'Subir' });
    await user.click(second);
    await user.click(button('settings-classes-save'));
    expect(save.mock.calls[0][0].classes.map((c) => c.name.es)).toEqual(['Juniors', 'Boxeo']);
  });

  it('can hide a class without deleting it', async () => {
    const { save, user } = await setup();
    await user.click(screen.getAllByRole('checkbox', { name: 'Visible en la web' })[1]);
    await user.click(button('settings-classes-save'));
    expect(save.mock.calls[0][0].classes[1].is_active).toBe(false);
  });

  it('does not save a new class without a name', async () => {
    const { save, user } = await setup();
    await user.click(button('settings-class-add'));
    await user.click(button('settings-classes-save'));
    expect(save).not.toHaveBeenCalled();
    expect(screen.getByText('Obligatorio, máximo 60 caracteres.')).toBeInTheDocument();
  });
});
