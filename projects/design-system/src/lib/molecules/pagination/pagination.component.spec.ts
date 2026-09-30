import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { PaginationComponent } from './pagination.component';

async function setup(currentPage: number, pages: number) {
  const pageChangeSpy = vi.fn();
  await render(PaginationComponent, {
    componentInputs: { currentPage, pages },
    componentOutputs: { pageChange: { emit: pageChangeSpy } as unknown as never },
  });
  return { pageChangeSpy };
}

describe('PaginationComponent', () => {
  it('renders nothing when pages is 1', async () => {
    await render(PaginationComponent, {
      componentInputs: { currentPage: 1, pages: 1 },
    });
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders prev/next buttons and page numbers', async () => {
    await setup(1, 5);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Página anterior')).toBeInTheDocument();
    expect(screen.getByLabelText('Página siguiente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });

  it('disables prev button on first page', async () => {
    await setup(1, 5);
    expect(screen.getByLabelText('Página anterior')).toBeDisabled();
    expect(screen.getByLabelText('Página siguiente')).not.toBeDisabled();
  });

  it('disables next button on last page', async () => {
    await setup(5, 5);
    expect(screen.getByLabelText('Página siguiente')).toBeDisabled();
    expect(screen.getByLabelText('Página anterior')).not.toBeDisabled();
  });

  it('marks active page with aria-current', async () => {
    await setup(3, 5);
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current');
  });

  it('emits pageChange when clicking a page number', async () => {
    const { pageChangeSpy } = await setup(1, 5);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(pageChangeSpy).toHaveBeenCalledWith(3);
  });

  it('emits pageChange when clicking next', async () => {
    const { pageChangeSpy } = await setup(2, 5);
    await userEvent.click(screen.getByLabelText('Página siguiente'));
    expect(pageChangeSpy).toHaveBeenCalledWith(3);
  });

  it('emits pageChange when clicking prev', async () => {
    const { pageChangeSpy } = await setup(3, 5);
    await userEvent.click(screen.getByLabelText('Página anterior'));
    expect(pageChangeSpy).toHaveBeenCalledWith(2);
  });

  it('shows ellipsis when pages > 7 and current is in the middle', async () => {
    await setup(6, 12);
    const ellipses = screen.getAllByText('…');
    expect(ellipses).toHaveLength(2);
  });

  it('shows no ellipsis at the start when current is near first page', async () => {
    await setup(2, 12);
    const ellipses = screen.queryAllByText('…');
    expect(ellipses).toHaveLength(1);
  });
});
