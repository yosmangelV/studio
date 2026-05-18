import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../projects/ui/src/lib/atoms/**/*.stories.@(ts|mdx)',
    '../projects/ui/src/lib/molecules/**/*.stories.@(ts|mdx)',
    '../projects/ui/src/lib/organisms/**/*.stories.@(ts|mdx)',
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  docs: {},
};

export default config;
