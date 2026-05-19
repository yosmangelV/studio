import type { Meta, StoryObj } from '@storybook/angular';
import { ImageComponent } from './image.component';

const SAMPLE = {
  landscape: 'https://picsum.photos/seed/couple1/800/450',
  portrait:  'https://picsum.photos/seed/couple2/600/800',
  square:    'https://picsum.photos/seed/couple3/600/600',
  broken:    'https://this-url-does-not-exist.invalid/image.jpg',
};

const meta: Meta<ImageComponent> = {
  title: 'Atoms/Image',
  component: ImageComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A responsive image atom with a shimmer skeleton placeholder, entrance animations, and error fallback.

While the image loads, an animated shimmer fills the container. Once loaded, the image enters
with the chosen animation. If \`src\` changes, the skeleton resets automatically and the entrance
animation replays for the new image.

**Animations:** \`fade\` (default, smooth opacity) · \`slide-up\` (rises 20px into position, pairs
well with animated text) · \`scale\` (grows from 96%, best for high-impact reveals like an
ultrasound photo) · \`none\` (instant, when the parent controls the transition).

**Aspect ratios:** \`16:9\` for landscape shots · \`4:3\` for classic horizontal photography ·
\`1:1\` for square crops · \`3:4\` for portrait photos and selfies · \`auto\` lets the image set its own height.

**Tips**
- \`alt\` is required and doubles as the accessible label in the error state.
- Combine \`radius="full"\` with \`aspectRatio="1:1"\` for circular avatar-style images.
- Use \`animation="scale"\` for dramatic reveal moments — cinematic without being distracting.
        `,
      },
    },
  },
  argTypes: {
    aspectRatio: {
      control: 'select',
      options: ['16:9', '4:3', '1:1', '3:4', 'auto'],
    },
    radius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
    },
    objectFit: {
      control: 'select',
      options: ['cover', 'contain'],
    },
    animation: {
      control: 'select',
      options: ['none', 'fade', 'slide-up', 'scale'],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 480px;">
        <ds-image
          [src]="src"
          [alt]="alt"
          [aspectRatio]="aspectRatio"
          [radius]="radius"
          [objectFit]="objectFit"
          [animation]="animation"
        />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<ImageComponent>;

export const Default: Story = {
  args: {
    src: SAMPLE.landscape,
    alt: 'Pareja en el parque',
    aspectRatio: '16:9',
    radius: 'lg',
    objectFit: 'cover',
    animation: 'fade',
  },
};

export const Portrait: Story = {
  args: {
    src: SAMPLE.portrait,
    alt: 'Foto retrato',
    aspectRatio: '3:4',
    radius: 'xl',
    objectFit: 'cover',
    animation: 'slide-up',
  },
};

export const Square: Story = {
  args: {
    src: SAMPLE.square,
    alt: 'Foto cuadrada',
    aspectRatio: '1:1',
    radius: 'full',
    objectFit: 'cover',
    animation: 'scale',
  },
};

export const AnimationFade: Story = {
  name: 'Animation — Fade',
  parameters: {
    docs: {
      description: {
        story: 'The default entrance. Opacity goes from 0 to 1 over 300ms. Use this for most images — it\'s subtle enough not to compete with the content itself.',
      },
    },
  },
  args: {
    src: SAMPLE.landscape,
    alt: 'Fade entrance',
    aspectRatio: '16:9',
    radius: 'lg',
    animation: 'fade',
  },
};

export const AnimationSlideUp: Story = {
  name: 'Animation — Slide Up',
  parameters: {
    docs: {
      description: {
        story: 'The image rises 20px into position while fading in. Works well for images that accompany text messages — it gives the feeling of content "arriving" on screen.',
      },
    },
  },
  args: {
    src: SAMPLE.landscape,
    alt: 'Slide up entrance',
    aspectRatio: '16:9',
    radius: 'lg',
    animation: 'slide-up',
  },
};

export const AnimationScale: Story = {
  name: 'Animation — Scale',
  parameters: {
    docs: {
      description: {
        story: 'The image grows from 96% to 100% while fading in. Best reserved for high-impact moments — a key reveal, a final photo, an ultrasound. The slight scale gives a cinematic weight without being distracting.',
      },
    },
  },
  args: {
    src: SAMPLE.landscape,
    alt: 'Scale entrance',
    aspectRatio: '16:9',
    radius: 'lg',
    animation: 'scale',
  },
};

export const ErrorState: Story = {
  name: 'Error (broken URL)',
  parameters: {
    docs: {
      description: {
        story: 'When the image fails to load, the container keeps its dimensions and shows a broken-image icon. The `alt` text becomes the accessible label. The layout never breaks.',
      },
    },
  },
  args: {
    src: SAMPLE.broken,
    alt: 'Image that failed to load',
    aspectRatio: '16:9',
    radius: 'lg',
    animation: 'fade',
  },
};

export const AllAspectRatios: Story = {
  render: () => ({
    props: { src: SAMPLE.landscape },
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 720px;">
        <div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">16:9</p>
          <ds-image [src]="src" alt="16:9" aspectRatio="16:9" radius="md" />
        </div>
        <div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">4:3</p>
          <ds-image [src]="src" alt="4:3" aspectRatio="4:3" radius="md" />
        </div>
        <div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">1:1</p>
          <ds-image [src]="src" alt="1:1" aspectRatio="1:1" radius="md" />
        </div>
      </div>
    `,
  }),
};
