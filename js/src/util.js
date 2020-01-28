/**
 * --------------------------------------------------------------------------
 * simplicss (v4.3.1): util.js
 * Licensed under MIT (https://github.com/twbs/simplicss/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'

/**
 * ------------------------------------------------------------------------
 * Private TransitionEnd Helpers
 * ------------------------------------------------------------------------
 */

 // transitionendイベント用で変数になってるのはprefixをつけるから？
const TRANSITION_END = 'transitionend'
const MAX_UID = 1000000
const MILLISECONDS_MULTIPLIER = 1000

// Shoutout AngusCroll (https://goo.gl/pxwQGp)
// オブジェクトの型を判定する
function toType(obj) {
  return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase()
}

//
function getSpecialTransitionEndEvent() {
  return {
    bindType: TRANSITION_END,
    delegateType: TRANSITION_END,
    handle(event) {
      if ($(event.target).is(this)) {
        return event.handleObj.handler.apply(this, arguments) // eslint-disable-line prefer-rest-params
      }
      return undefined // eslint-disable-line no-undefined
    }
  }
}

// transitionの遷移時間を引数でもらう
function transitionEndEmulator(duration) {
  let called = false

  // 呼び出しもとのエレメントでTRANSITION_ENDを実行
  $(this).one(Util.TRANSITION_END, () => {
    // コールバックをtrueにする
    called = true
  })

  setTimeout(() => {
    // falseだったらtriggerTransitionEndを実行する
    if (!called) {
      Util.triggerTransitionEnd(this)
    }
  }, duration) // settimeoutの時間は引数の遷移時間
  // エレメントを返す
  return this
}

function setTransitionEndSupport() {
  // Jqueryのカスタムプラグインを作成
  $.fn.emulateTransitionEnd = transitionEndEmulator
  $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent()
}

/**
 * --------------------------------------------------------------------------
 * Public Util Api
 * --------------------------------------------------------------------------
 */

const Util = {

  TRANSITION_END: 'scTransitionEnd',
  
  //prefixはNAME(tooltipだとtooltipとか)
  getUID(prefix) {
    do {
      // eslint-disable-next-line no-bitwise
      prefix += ~~(Math.random() * MAX_UID) // ランダムな値を生成
    } while (document.getElementById(prefix)) // 一致するIDの分だけ続行
    return prefix
  },

  getSelectorFromElement(element) {
    // 引数elementのdata-target属性の値を取得
    let selector = element.getAttribute('data-target')

    // data-targetが存在しないか#の場合
    if (!selector || selector === '#') {
      // 引数elementのhref属性の値を取得
      const hrefAttr = element.getAttribute('href')
      // hrefAttrがあったら#かどうかを判定して、trueならhrefAttrをtrimして返す。falseなら、空文字を入れる
      // trim: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/trim
      selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : ''
    }

    try {
      // html内のdata-targetもしくはhregで指定されているselectorを返す
      // data-targetの対象を返す
      // なかったらnullを返す
      return document.querySelector(selector) ? selector : null
    } catch (err) {
      // エラーになったらnullを返す
      return null
    }
  },

  // 要素から遷移時間を取得
  getTransitionDurationFromElement(element) {
    // エレメントがなかったら0を返す
    if (!element) {
      return 0
    }

    // transition-durationとtransition-delayの値を取得
    let transitionDuration = $(element).css('transition-duration')
    let transitionDelay = $(element).css('transition-delay')

    // 浮動小数点を取得
    const floatTransitionDuration = parseFloat(transitionDuration)
    const floatTransitionDelay = parseFloat(transitionDelay)

    // cssプロパティ、値がなければ0を返す
    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0
    }

    // 複数値が指定されてたら最初の1つだけ取得する
    transitionDuration = transitionDuration.split(',')[0]
    transitionDelay = transitionDelay.split(',')[0]

    // 変化にかかる時間(transitionDuration)と変化が始める時間(transitionDelay)を足して1000をかけて(秒にする)返す
    return (parseFloat(transitionDuration) + parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER // ×1000する
  },

  reflow(element) {
    return element.offsetHeight
  },

  // 引数エレメントでtrainsition_endイベントを実行する
  triggerTransitionEnd(element) {
    $(element).trigger(TRANSITION_END)
  },

  // TODO: Remove in v5
  supportsTransitionEnd() {
    return Boolean(TRANSITION_END)
  },

  // 引数がdom要素か判定する
  // 違う場合はundefinedを返す
  isElement(obj) {
    return (obj[0] || obj).nodeType
  },

  // configの値がDefaultType
  typeCheckConfig(componentName, config, configTypes) {
    // default typeの分だけループ
    // dropdownだとoffset、flipなどなど
    for (const property in configTypes) {
      // Object.prototype.hasOwnPropertyはオブジェクトにpropertyがあるか判定する
      // offsetプロパティが、configTypesにあるか
      if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
        // configTypesからプロパティの値を取得(正規表現で使う文字列)
        const expectedTypes = configTypes[property]
        // configの中からpropertyの値を取得
        const value = config[property]
        // valueが存在してdom要素だった場合は文字列(element)を格納
        // falseの場合は型を判定して格納
        const valueType = value && Util.isElement(value)
          ? 'element' : toType(value)

        //  expectedTypesの正規表現に、valueTypeが一致しているか確認
        if (!new RegExp(expectedTypes).test(valueType)) {
          // 一致してなかったらthrowする
          throw new Error(
            `${componentName.toUpperCase()}: ` +
            `Option "${property}" provided type "${valueType}" ` +
            `but expected type "${expectedTypes}".`)
        }
      }
    }
  },

  findShadowRoot(element) {
    // shadow domが関連付けされてないときはnullを返す
    if (!document.documentElement.attachShadow) {
      return null
    }

    // elementのgetRootNodeがfunctionなら
    if (typeof element.getRootNode === 'function') {
      // elementのroot要素を取得
      const root = element.getRootNode()
      // rootがshadowrootのインスタンスならrootを返す。
      // そうじゃない場合はnullを返す
      return root instanceof ShadowRoot ? root : null
    }

    // elementがshadow domのインスタンス
    // つまりshadow domの要素だったら、elementを返す
    if (element instanceof ShadowRoot) {
      return element
    }

    // shadow domのルートが探せない場合はnullを返す
    if (!element.parentNode) {
      return null
    }
    // elementのparentNodeに対して同じ操作を繰り返す
    return Util.findShadowRoot(element.parentNode)
  },

  jQueryDetection() {
    if (typeof $ === 'undefined') {
      throw new TypeError('simplicss\'s JavaScript requires jQuery. jQuery must be included before simplicss\'s JavaScript.')
    }

    const version = $.fn.jquery.split(' ')[0].split('.')
    const minMajor = 1
    const ltMajor = 2
    const minMinor = 9
    const minPatch = 1
    const maxMajor = 4

    if (version[0] < ltMajor && version[1] < minMinor || version[0] === minMajor && version[1] === minMinor && version[2] < minPatch || version[0] >= maxMajor) {
      throw new Error('simplicss\'s JavaScript requires at least jQuery v1.9.1 but less than v4.0.0')
    }
  }
}

Util.jQueryDetection()
setTransitionEndSupport()

export default Util
