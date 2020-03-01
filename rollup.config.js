import path from 'path'

import pug from 'pug'

import typescript from '@rollup/plugin-typescript'
import scss from 'rollup-plugin-scss'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'
import html from '@rollup/plugin-html'

import pkg from './package.json'

const outDir = 'dist'

export default {
  input: 'src/index.ts',
  output: {
    file: path.resolve(outDir, 'bundle.js'),
    format: 'iife',
    sourcemap: !process.env.ELECTRON
  },
  watch: {
    chokidar: {
      usePolling: true,
      paths: 'src/**'
    }
  },
  plugins: [
    del({
      targets: path.join(outDir, '*'),
      runOnce: true
    }),
    typescript(),
    scss({
      output: path.resolve(outDir, 'bundle.css')
    }),
    commonjs(),
    resolve(),
    html({
      template: ({ attributes, files, publicPath }) => {
        const scripts = (files.js || [])
          .map(({ fileName }) => {
            const attrs = html.makeHtmlAttributes(attributes.script)
            return `<script src="${publicPath}${fileName}"${attrs}></script>`
          })
          .join('\n')

        const links = (files.css || [])
          .map(({ fileName }) => {
            const attrs = html.makeHtmlAttributes(attributes.link)
            return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`
          })
          .join('\n')

        return pug.compileFile('src/index.pug')({
          description: pkg.description,
          title: pkg.name,
          scripts,
          links
        })
      }
    }),
    copy({
      targets: [
        { src: 'public/**/*', dest: outDir }
      ]
    }),
    ...(process.env.SERVE ? [
      serve(outDir),
      livereload(outDir)
    ] : []),
    ...(process.env.NODE_ENV === 'production' ? [
      terser()
    ] : [])
  ]
}
