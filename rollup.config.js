import pkg from './package.json'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'

const path = require('path')

const outputFile = path.resolve(__dirname, 'dist', `${pkg.name}.js`)
const entryFile = path.resolve(__dirname, 'src', 'index.js')
const outputName = 'cssVarPoly'

const babelSettings = {
  exclude: ['node_modules/**'],
  presets: [
    ['@babel/env']
  ],
  babelHelpers: 'bundled'
}

const terserSettings = {
  beautify: {
    compress: false,
    mangle: false,
    output: {
      beautify: true,
      comments: /(?:^!|@(?:license|preserve))/
    }
  },
  minify: {
    compress: true,
    mangle: true,
    output: {
      comments: new RegExp(pkg.name)
    }
  }
}

// ES Module
const esm = {
  input: entryFile,
  output: {
    file: outputFile.replace(/\.js$/, '.esm.js'),
    format: 'esm',
    name: outputName
  },
  plugins: [
    babel(babelSettings),
    terser(terserSettings.beautify)
  ]
}

// ES Module (Minified)
const esmMinified = {
  input: entryFile,
  output: {
    file: esm.output.file.replace(/\.js$/, '.min.js'),
    format: esm.output.format,
    name: outputName
  },
  plugins: [
    babel(babelSettings),
    terser(terserSettings.minify)
  ]
}

// UMD
const umd = {
  input: entryFile,
  output: {
    file: outputFile,
    format: 'umd',
    name: outputName
  },
  plugins: [
    babel(babelSettings),
    terser(terserSettings.beautify)
  ]
}

// UMD (Minified)
const umdMinified = {
  input: entryFile,
  output: {
    file: umd.output.file.replace(/\.js$/, '.min.js'),
    format: umd.output.format,
    name: outputName
  },
  plugins: [
    babel(babelSettings),
    terser(terserSettings.minify)
  ]
}

export default [
  esm, esmMinified, umd, umdMinified
]
