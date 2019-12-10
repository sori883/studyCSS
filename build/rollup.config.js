'use strict'

const path = require('path')
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')

const BUNDLE = process.env.BUNDLE === 'true'

let fileDest = 'simplicss.js'
const external = ['jquery', 'popper.js']
const plugins = [
  // babelをインスタンス化すると.babelrc.jsが実行されるみたい。
  babel({
    exclude: 'node_modules/**', // 参考：https://ja.stackoverflow.com/q/36894
    externalHelpersWhitelist: [ // 必要なhelperのみを追加
      'defineProperties',
      'createClass',
      'inheritsLoose',
      'defineProperty',
      'objectSpread2'
    ]
  })
]

const globals = {
  jquery: 'jQuery',
  'popper.js': 'Popper'
}

// popper用に残しておくけどjqueryだけだと意味ないよ
if (BUNDLE) {
  fileDest = 'simplicss.bundle.js'
  external.pop()
  delete globals['popper.js']
  plugins.push(resolve())
}

module.exports = {
  input: path.resolve(__dirname, '../js/src/index.js'),
  output: {
    file: path.resolve(__dirname, `../dist/js/${fileDest}`),
    format: 'umd',
    globals, //output.globalsを使用して、外部モジュールjqueryに対応するブラウザーのグローバル変数名を指定します（「jquery」と推測）
    name: 'simplicss'
  },
  external, // 含まない外部ライブラリ
  plugins // babelとか含むやつら
}
