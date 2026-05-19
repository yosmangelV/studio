import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../projects/design-system/src/lib/atoms/**/*.stories.@(ts|mdx)',
    '../projects/design-system/src/lib/molecules/**/*.stories.@(ts|mdx)',
    '../projects/design-system/src/lib/organisms/**/*.stories.@(ts|mdx)',
  ],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  docs: { defaultName: 'Docs' },
};

export default config;
