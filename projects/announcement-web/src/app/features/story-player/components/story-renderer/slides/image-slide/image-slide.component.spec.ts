import { render, screen } from '@testing-library/angular';
import { AnnouncementSlide, MessageType } from '../../../../../../core/models/announcement.models';
import { ImageSlideComponent } from './image-slide.component';

const baseSlide: AnnouncementSlide = {
  title: 'Nuestra primera foto',
  body: 'La primera vez que la vimos',
  image: 'https://example.com/photo.jpg',
  altText: 'Ecografía de doce semanas',
  messageType: MessageType.IMAGE,
  footer: 'Con amor',
};

const renderSlide = (slide: AnnouncementSlide) =>
  render(ImageSlideComponent, { inputs: { slide } });

describe('ImageSlideComponent', () => {
  it('uses the slide altText as the image alt, not the title', async () => {
    await renderSlide(baseSlide);

    expect(screen.getByRole('img', { name: 'Ecografía de doce semanas' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Nuestra primera foto' })).not.toBeInTheDocument();
  });

  it('renders the slide body as the caption', async () => {
    await renderSlide(baseSlide);

    const caption = screen.getByTestId('announcement-slide-caption');
    expect(caption).toHaveTextContent('La primera vez que la vimos');
    expect(caption).not.toHaveTextContent('[object Object]');
  });

  it('omits the caption when the slide has no body', async () => {
    await renderSlide({ ...baseSlide, body: '' });

    expect(screen.queryByTestId('announcement-slide-caption')).not.toBeInTheDocument();
  });

  it('falls back to the text layout without an empty img when there is no image', async () => {
    const { image, ...withoutImage } = baseSlide;
    void image;
    await renderSlide(withoutImage);

    expect(screen.queryByTestId('announcement-slide-image')).not.toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText('La primera vez que la vimos')).toBeInTheDocument();
  });
});
