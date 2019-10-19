/* eslint-env node */
/* eslint no-process-env: 0 */

// node.jsのパスを読み込み
const path = require('path')
// 起動するブラウザへのIpアドレスを設定する用途みたい
const ip = require('ip')
// browsers.jsから対象ブラウザを持ってきてる
const {
  browsers,
  browsersKeys
} = require('./browsers')

// jqueryを最新にするか古いのにするか
const jqueryFile = process.env.USE_OLD_JQUERY ? 'https://code.jquery.com/jquery-1.9.1.min.js' : 'node_modules/jquery/dist/jquery.slim.min.js'
// jqueryをバンドルするか
const bundle = process.env.BUNDLE === 'true'
// BrowserStackってサービスがあるみたい。お高いんでBrowserStackはなしやな
// https://qiita.com/mizchi/items/83f5f276cb548d0571bf
const browserStack = process.env.BROWSER === 'true'

// karmaのフレームワーク
const frameworks = [
  'qunit',
  'sinon'
]

// node_modulesの中にあるフレームワーク本体
const plugins = [
  'karma-qunit',
  'karma-sinon'
]

// レポータなのはわかるけど、dotsってなんや。。
const reporters = ['dots']

// ローカルにはいってるブラウザを検出する
const detectBrowsers = {
  usePhantomJS: false,
  postDetection(availableBrowser) {
    if (process.env.CI === true || availableBrowser.includes('Chrome')) {
      return ['ChromeHeadless']
    }

    if (availableBrowser.includes('Firefox')) {
      return ['FirefoxHeadless']
    }

    throw new Error('Please install Firefox or Chrome')
  }
}

// headlessってCLIブラウザのことみたい
const customLaunchers = {
  FirefoxHeadless: {
    base: 'Firefox',
    flags: ['-headless']
  }
}

// ここ入れるファイルないんやなぁ
let files = [
  'node_modules/popper.js/dist/umd/popper.min.js',
  'node_modules/hammer-simulator/index.js'
]

// 最終的にkarmaに落とし込む設定
const conf = {
  basePath: '../..',
  port: 9876,
  colors: true,
  autoWatch: false,
  singleRun: true,
  concurrency: Infinity,
  client: {
    qunit: {
      showUI: true
    }
  }
}

if (bundle) {
  // フレームワークにChromeHeadlessとかを追加する
  // detectBrowsersはpluginとframeworksに追加しないとだめみたい
  // https://www.npmjs.com/package/karma-detect-browsers
  frameworks.push('detectBrowsers')
  // カバレッジ使わないバージョンなの？？？
  plugins.push(
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-detect-browsers'
  )
  // カスタムランチャー（firefox）
  conf.customLaunchers = customLaunchers
  // 検出したLauncher
  conf.detectBrowsers = detectBrowsers
  // これrootのdist
  files = files.concat([
    jqueryFile, 
    'dist/js/bootstrap.js'
  ])
} else if (browserStack) { // BrowserStackなのでここはいらんな
  conf.hostname = ip.address()
  conf.browserStack = {
    username: process.env.BROWSER_STACK_USERNAME,
    accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
    build: `bootstrap-${new Date().toISOString()}`,
    project: 'Bootstrap',
    retryLimit: 2
  }
  plugins.push('karma-browserstack-launcher')
  conf.customLaunchers = browsers
  conf.browsers = browsersKeys
  reporters.push('BrowserStack')
  files = files.concat([
    'node_modules/jquery/dist/jquery.slim.min.js',
    'js/dist/util.js',
    'js/dist/tooltip.js',
    'js/dist/!(util|index|tooltip).js' // include all of our js/dist files except util.js, index.js and tooltip.js
  ])
} else {
  // バンドルなしバージョン（jqueryなしバージョン）
  frameworks.push('detectBrowsers')
  // バンドルしない場合は'karma-coverage-istanbul-reporter'を突っ込むんすね
  plugins.push(
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-detect-browsers',
    'karma-coverage-istanbul-reporter'
  )
  // カバレッジのファイル読み込んどるやんけ。。
  files = files.concat([
    jqueryFile,
    'js/coverage/dist/util.js',
    'js/coverage/dist/tooltip.js',
    'js/coverage/dist/!(util|index|tooltip).js' // include all of our js/dist files except util.js, index.js and tooltip.js
  ])
  // レポータ追加
  reporters.push('coverage-istanbul')
  // firefoxやんな
  conf.customLaunchers = customLaunchers
  // 検出したブラウザやんな
  conf.detectBrowsers = detectBrowsers
  // レポータの設定
  conf.coverageIstanbulReporter = {
    dir: path.resolve(__dirname, '../coverage/'),
    reports: ['lcov', 'text-summary'],
    thresholds: {
      emitWarning: false,
      global: {
        statements: 90,
        branches: 86,
        functions: 89,
        lines: 90
      }
    }
  }
}

// 単体テスト追加
files.push('js/tests/unit/*.js')

conf.frameworks = frameworks
conf.plugins = plugins
conf.reporters = reporters
conf.files = files

module.exports = (karmaConfig) => {
  // possible values: karmaConfig.LOG_DISABLE || karmaConfig.LOG_ERROR || karmaConfig.LOG_WARN || karmaConfig.LOG_INFO || karmaConfig.LOG_DEBUG
  conf.logLevel = karmaConfig.LOG_ERROR || karmaConfig.LOG_WARN
  karmaConfig.set(conf)
}