import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import * as meta from './package.json';

const config = {
  input: 'src/index.js',
  external: [
    'hammerjs',
    Object.keys(meta.dependencies || {}).filter(key => /^d3-/.test(key)),
  ],
  output: {
    file: `dist/${meta.name}.js`,
    name: 'd3',
    format: 'umd',
    indent: false,
    extend: true,
    banner: `// ${meta.homepage} v${
      meta.version
    } Copyright ${new Date().getFullYear()} ${meta.author.name}`,
    globals: Object.assign(
      {},
      ...Object.keys(meta.dependencies || {})
        .filter(key => /^d3-/.test(key))
        .map(key => ({ [key]: 'd3' }))
    ),
  },
  plugins: [nodeResolve({ only: ['lodash-es'] })],
};

export default [
  config,
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${meta.name}.min.js`,
    },
    plugins: [
      ...config.plugins,
      terser({
        output: {
          preamble: config.output.banner,
        },
      }),
    ],
  },
];
