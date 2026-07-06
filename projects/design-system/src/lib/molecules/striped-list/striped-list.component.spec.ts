import { render, screen } from '@testing-library/angular';
import { StripedListComponent } from './striped-list.component';

const ITEMS = [
  { index: '01', name: 'Boxeo', description: 'Técnica y condición física' },
  { index: '02', name: 'Kickboxing', description: 'Combinación de golpes y patadas' },
];

describe('StripedListComponent', () => {
  it('renders all item names', async () => {
    await render(StripedListComponent, {
      componentInputs: { items: ITEMS },
    });
    expect(screen.getByText('Boxeo')).toBeInTheDocument();
    expect(screen.getByText('Kickboxing')).toBeInTheDocument();
  });

  it('renders all item descriptions', async () => {
    await render(StripedListComponent, {
      componentInputs: { items: ITEMS },
    });
    expect(screen.getByText('Técnica y condición física')).toBeInTheDocument();
    expect(screen.getByText('Combinación de golpes y patadas')).toBeInTheDocument();
  });

  it('renders the correct number of list items', async () => {
    await render(StripedListComponent, {
      componentInputs: { items: ITEMS },
    });
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows arrow indicators by default', async () => {
    const { container } = await render(StripedListComponent, {
      componentInputs: { items: ITEMS },
    });
    expect(container.querySelectorAll('.striped-list__arrow')).toHaveLength(2);
  });

  it('hides arrow indicators when showArrow is false', async () => {
    const { container } = await render(StripedListComponent, {
      componentInputs: { items: ITEMS, showArrow: false },
    });
    expect(container.querySelector('.striped-list__arrow')).not.toBeInTheDocument();
  });
});
