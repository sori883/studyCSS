/*!
 * Script to build our plugins to use them separately.
 * Copyright 2019 The Bootstrap Authors
 * Copyright 2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */


'use strict'

const path    = require('path')
const rollup  = require('rollup')
const babel   = require('rollup-plugin-babel')

const TEST    = process.env.NODE_ENV === 'test'
const plugins = [
  babel({
    exclude: 'node_modules/**', // Only transpile our source code
    externalHelpersWhitelist: [ // Include only required helpers
      'defineProperties',
      'createClass',
      'inheritsLoose',
      'defineProperty',
      'objectSpread2'
    ]
  })
]

// TODO: プラグイン追加
const bsPlugins = {
  study: path.resolve(__dirname, '../js/src/study.js')
}
const rootPath = TEST ? '../js/coverage/dist/' : '../js/dist/'

function build(plugin) {
  console.log(`Building ${plugin} plugin...`)

  const external = ['jquery']
  const globals = {
    jquery: 'jQuery'
  }

  //Do not bundle Util in plugins
   if (plugin !== 'Util') {
     external.push(bsPlugins.Util)
     globals[bsPlugins.Util] = 'Util'
  }

  const pluginFilename = `${plugin.toLowerCase()}.js`

  rollup.rollup({
    input: bsPlugins[plugin],
    plugins,
    external
  }).then((bundle) => {
    bundle.write({
      format: 'umd',
      name: plugin,
      sourcemap: true,
      globals,
      file: path.resolve(__dirname, `${rootPath}${pluginFilename}`)
    })
      .then(() => console.log(`Building ${plugin} plugin... Done!`))
      .catch((err) => console.error(`${plugin}: ${err}`))
  })
}

Object.keys(bsPlugins).forEach((plugin) => build(plugin))
