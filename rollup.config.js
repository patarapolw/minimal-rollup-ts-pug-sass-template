import fs from 'fs'
import path from 'path'

import pug from 'pug'
import dotenv from 'dotenv'

import typescript from '@rollup/plugin-typescript'
import scss from 'rollup-plugin-scss'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'
import pugPlugin from 'rollup-plugin-pug'
import replace from '@rollup/plugin-replace'

import pkg from './package.json'
dotenv.config()

const outDir = process.env.OUT_DIR || 'dist'

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: path.resolve(outDir, 'module'),
      format: 'esm',
      sourcemap: !process.env.ELECTRON
    },
    {
      dir: path.join(outDir, 'nomodule'),
      format: 'system',
      sourcemap: true
    }
  ],
  watch: {
    chokidar: true,
    include: [
      'src/**',
      'src/index.pug',
      'public/**'
    ]
  },
  plugins: [
    del({
      targets: path.join(outDir, '*'),
      runOnce: true
    }),
    replace({
      __routerMode__: process.env.ROUTER_MODE
    }),
    typescript(),
    scss({
      output: path.resolve(outDir, 'bundle.css')
    }),
    pugPlugin(),
    commonjs(),
    resolve(),
    {
      name: 'emitPug',
      generateBundle () {
        fs.writeFileSync(path.join(outDir, 'index.html'), pug.compileFile('src/index.pug')({
          description: pkg.description,
          title: pkg.name
        }))
      }
    },
    copy({
      targets: [
        { src: 'public/**/*', dest: outDir }
      ]
    }),
    ...(process.env.SERVE ? [
      serve({
        contentBase: outDir,
        historyApiFallback: '/'
      }),
      livereload(outDir)
    ] : []),
    ...(process.env.NODE_ENV === 'production' ? [
      terser()
    ] : [])
  ]
}
