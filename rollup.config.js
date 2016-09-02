import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'index.js',
  format: 'cjs',
  plugins: [  nodeResolve(), babel({
      exclude: 'node_modules/**'
    }) ],
  dest: 'bundle.js'
};