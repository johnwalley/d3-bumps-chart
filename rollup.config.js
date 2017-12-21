import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  external: ['hammerjs'],
  plugins: [babel(), nodeResolve()],
};
