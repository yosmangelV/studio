import nxPlugin from '@nx/eslint-plugin';

export default [
  {
    plugins: { '@nx': nxPlugin },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          depConstraints: [
            {
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: ['type:util', 'type:shared'],
            },
            {
              sourceTag: 'scope:frontend',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'type:shared'],
            },
          ],
        },
      ],
    },
  },
];
