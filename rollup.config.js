import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

process.chdir(__dirname);

const bundle = {
  input: './index.js',
  output: {
    file: './js/dist/pagelets.min.js',
    name: 'Pagelets',
    format: 'iife',
  },
  plugins: [
    resolve({browser: true, preferBuiltins: false}),
    commonjs(),
    terser(),
  ],
};

const demo = {
  input: './demo/demo.js',
  output: {
    file: './demo/demo.min.js',
    name: 'Pagelets',
    format: 'iife',
  },
  plugins: [
    resolve({browser: true, preferBuiltins: false}),
    commonjs(),
    terser(),
  ],
};


const existing = {
  input: './demo/existing.js',
  output: {
    file: './demo/existing.min.js',
    name: 'Pagelets',
    format: 'iife',
  },
  plugins: [
    resolve({browser: true, preferBuiltins: false}),
    commonjs(),
    terser(),
  ],
};

export default [bundle, demo, existing];
