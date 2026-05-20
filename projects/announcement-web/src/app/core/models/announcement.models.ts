export type AudienceType = 'special' | 'friends' | 'family';

export type SlideType =
  | 'intro'
  | 'text'
  | 'image'
  | 'text-image'
  | 'countdown'
  | 'envelope'
  | 'ultrasound-reveal'
  | 'final-reveal';

export type SlideAnimation = 'fade' | 'fade-up' | 'slide-up' | 'soft-scale' | 'reveal' | 'none';

export type StoryTheme = 'soft-pastel';

export type StoryStatus = 'idle' | 'loading' | 'success' | 'error';

type BaseSlide = {
  id: string;
  animation?: SlideAnimation;
};

export type IntroSlide = BaseSlide & {
  type: 'intro';
  eyebrow?: string;
  title?: string;
  body: string;
  emphasis?: string;
};

export type TextSlide = BaseSlide & {
  type: 'text';
  eyebrow?: string;
  title?: string;
  body: string;
  emphasis?: string;
};

export type ImageSlide = BaseSlide & {
  type: 'image';
  imageUrl: string;
  alt: string;
  caption?: string;
};

export type TextImageSlide = BaseSlide & {
  type: 'text-image';
  title?: string;
  body?: string;
  emphasis?: string;
  imageUrl: string;
  alt: string;
  imagePosition?: 'top' | 'bottom' | 'center';
};

export type CountdownSlide = BaseSlide & {
  type: 'countdown';
  value: number;
};

export type EnvelopeSlide = BaseSlide & {
  type: 'envelope';
  title?: string;
  body?: string;
  emphasis?: string;
  cta?: string;
};

export type UltrasoundRevealSlide = BaseSlide & {
  type: 'ultrasound-reveal';
  imageUrl: string;
  alt: string;
  badgeText?: string;
  title?: string;
  body?: string;
};

export type FinalRevealSlide = BaseSlide & {
  type: 'final-reveal';
  title: string;
  subtitle?: string;
  message?: string;
  imageUrl?: string;
  alt?: string;
};

export type AnnouncementSlide =
  | IntroSlide
  | TextSlide
  | ImageSlide
  | TextImageSlide
  | CountdownSlide
  | EnvelopeSlide
  | UltrasoundRevealSlide
  | FinalRevealSlide;

export type AnnouncementStory = {
  id: string;
  code: string;
  audienceType: AudienceType;
  recipientName?: string | null;
  theme: StoryTheme;
  slides: AnnouncementSlide[];
};
