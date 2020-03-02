// eslint-disable-next-line no-global-assign
require = require('esm')(module)
const rollup = require('rollup')
const chokidar = require('chokidar')

const config = require('./rollup.config').default
const { output: outputConfig } = config

let isBuilding = false
let buildCount = 0

async function build (bundle) {
  isBuilding = true

  if (buildCount > 0) {
    console.log('Rebuilding')
  } else {
    console.log('Building')
  }
  buildCount++

  await bundle.write(outputConfig)
  isBuilding = false
}

;(async () => {
  const bundle = await rollup.rollup(config)

  chokidar.watch([
    ...bundle.watchFiles,
    'src/**',
    'public/**'
  ]).on('all', (event, path) => {
    console.log(event, path)
    if (!isBuilding) {
      build(bundle)
    }
  })

  build(bundle)
})()
