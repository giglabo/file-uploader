import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';
// eslint-disable-next-line @nx/enforce-module-boundaries
import rd from '../../root_directory';

export default {
  content: [
    join(rd(), 'apps/demo-nextjs', '{src,pages,components,app,content}/**/*!(*.stories|*.spec).{ts,tsx,html,mdx}'),
    join(__dirname, '{src,pages,components,app,content}/**/*!(*.stories|*.spec).{ts,tsx,html,mdx}'),
    join(rd(), 'apps/shared-react-components/lib', '{src,pages,components,app,content}/**/*!(*.stories|*.spec).{ts,tsx,html,mdx}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],

  // content: [
  //    join(__dirname, '{src,pages,components,app,content}/**/*!(*.stories|*.spec).{ts,tsx,html,mdx}'),
  //   join(rd(), 'apps/shared-react-components/lib', '{src,pages,components,app,content}/**/*!(*.stories|*.spec).{ts,tsx,html,mdx}'),
  //   ...createGlobPatternsForDependencies(__dirname),
  // ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
};
