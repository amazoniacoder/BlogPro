import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/ui-system/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/ui-system/**/*.story.@(js|jsx|ts|tsx|mdx)'
  ],
  
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y'
  ],
  
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation'
  }
};

export default config;