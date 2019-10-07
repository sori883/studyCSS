'use strict'

const path = require('path')
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')


let fileDest = 'simplicss.js'
const external = ['jquery']

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

const globals = {
  jquery: 'jQuery' // Ensure we use jQuery which is always available even in noConflict mode
}

module.exports = {
  input: path.resolve(__dirname, '../js/script.js'),
  output: {
    file: path.resolve(__dirname, `../dist/js/${fileDest}`),
    format: 'umd',
    globals,
    name: 'simplicss'
  },
  external,
  plugins
}