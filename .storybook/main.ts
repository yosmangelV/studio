import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../projects/ui/src/**/*.stories.@(ts|mdx)'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  docs: {},
};

export default config;
