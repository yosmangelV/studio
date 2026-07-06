import { render, screen, fireEvent } from '@testing-library/angular';
import { ImageComponent } from './image.component';

describe('ImageComponent', () => {
  it('renders img with correct src and alt', async () => {
    await render(ImageComponent, {
      componentInputs: { src: '/photo.jpg', alt: 'A boxer training' },
    });
    const img = screen.getByRole('img', { name: 'A boxer training' }) as HTMLImageElement;
    expect(img.src).toContain('/photo.jpg');
  });

  it('shows skeleton before image loads', async () => {
    const { container } = await render(ImageComponent, {
      componentInputs: { src: '/photo.jpg', alt: 'Photo' },
    });
    expect(container.querySelector('.img-wrap__skeleton')).toBeInTheDocument();
  });

  it('hides skeleton and shows image after load event', async () => {
    const { container } = await render(ImageComponent, {
      componentInputs: { src: '/photo.jpg', alt: 'Photo' },
    });
    const img = container.querySelector('img')!;
    fireEvent.load(img);
    expect(container.querySelector('.img-wrap__skeleton')).not.toBeInTheDocument();
    expect(img).toHaveClass('img-wrap__img--loaded');
  });

  it('shows error state when image fails to load', async () => {
    const { container } = await render(ImageComponent, {
      componentInputs: { src: '/broken.jpg', alt: 'Broken image' },
    });
    const img = container.querySelector('img')!;
    fireEvent.error(img);
    expect(container.querySelector('.img-wrap__error')).toBeInTheDocument();
  });

  it('applies aspect ratio class', async () => {
    const { container } = await render(ImageComponent, {
      componentInputs: { src: '/photo.jpg', alt: 'Photo', aspectRatio: '1:1' },
    });
    expect(container.querySelector('.img-wrap')).toHaveClass('img-wrap--1-1');
  });

  it('applies radius class', async () => {
    const { container } = await render(ImageComponent, {
      componentInputs: { src: '/photo.jpg', alt: 'Photo', radius: 'full' },
    });
    expect(container.querySelector('.img-wrap')).toHaveClass('img-wrap--full');
  });
});
