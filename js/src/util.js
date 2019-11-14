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

function transitionEndEmulator(duration) {
  let called = false

  $(this).one(Util.TRANSITION_END, () => {
    called = true
  })

  setTimeout(() => {
    if (!called) {
      Util.triggerTransitionEnd(this)
    }
  }, duration)

  return this
}

function setTransitionEndSupport() {
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

  getUID(prefix) {
    do {
      // eslint-disable-next-line no-bitwise
      prefix += ~~(Math.random() * MAX_UID) // "~~" acts like a faster Math.floor() here
    } while (document.getElementById(prefix))
    return prefix
  },

  getSelectorFromElement(element) {
    // 引数elementのdata-target属性の値を取得
    let selector = element.getAttribute('data-target')

    // data-targetが存在しないか#の場合
    if (!selector || selector === '#') {
      // 引数elementのhref属性の値を取得
      const hrefAttr = element.getAttribute('href')
      // hrefAttrがなかったら左のhrefAttrを返す=ifはfalseになり''が代入される
      // hrefAttrがあったら#かどうかを判定して、#じゃなかったらtrimする。
      // trim: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/trim
      selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : ''
    }

    try {
      // html内のdata-targetもしくはhregで指定されているselectorを返す
      // data-targetかtrimされたhrefのどっちか
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

  triggerTransitionEnd(element) {
    $(element).trigger(TRANSITION_END)
  },

  // TODO: Remove in v5
  supportsTransitionEnd() {
    return Boolean(TRANSITION_END)
  },

  isElement(obj) {
    return (obj[0] || obj).nodeType
  },

  typeCheckConfig(componentName, config, configTypes) {
    for (const property in configTypes) {
      if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
        const expectedTypes = configTypes[property]
        const value         = config[property]
        const valueType     = value && Util.isElement(value)
          ? 'element' : toType(value)

        if (!new RegExp(expectedTypes).test(valueType)) {
          throw new Error(
            `${componentName.toUpperCase()}: ` +
            `Option "${property}" provided type "${valueType}" ` +
            `but expected type "${expectedTypes}".`)
        }
      }
    }
  },

  findShadowRoot(element) {
    if (!document.documentElement.attachShadow) {
      return null
    }

    // Can find the shadow root otherwise it'll return the document
    if (typeof element.getRootNode === 'function') {
      const root = element.getRootNode()
      return root instanceof ShadowRoot ? root : null
    }

    if (element instanceof ShadowRoot) {
      return element
    }

    // when we don't find a shadow root
    if (!element.parentNode) {
      return null
    }

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