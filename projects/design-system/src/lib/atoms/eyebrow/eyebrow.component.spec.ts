import { render, screen } from '@testing-library/angular';
import { EyebrowComponent } from './eyebrow.component';

describe('EyebrowComponent', () => {
  it('renders the label', async () => {
    await render(EyebrowComponent, {
      componentInputs: { label: 'Nosotros' },
    });
    expect(screen.getByText('Nosotros')).toBeInTheDocument();
  });

  it('applies start alignment by default', async () => {
    const { container } = await render(EyebrowComponent, {
      componentInputs: { label: 'Label' },
    });
    expect(container.querySelector('.eyebrow')).not.toHaveClass('eyebrow--center');
  });

  it('applies center alignment class when align is center', async () => {
    const { container } = await render(EyebrowComponent, {
      componentInputs: { label: 'Label', align: 'center' },
    });
    expect(container.querySelector('.eyebrow')).toHaveClass('eyebrow--center');
  });
});
