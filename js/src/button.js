/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.3.1): button.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

// aria-pressedは要素が押されている状態
// .activeはactive状態

import $ from 'jquery'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME  = 'button'
const VERSION = '0.5.2'
const DATA_KEY = 'sc.button'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]

const ClassName = {
  ACTIVE : 'active',
  BUTTON : 'btn',
  FOCUS  : 'focus'
}

const Selector = {
  DATA_TOGGLE_CARROT : '[data-toggle^="button"]',
  DATA_TOGGLES : '[data-toggle="buttons"]',
  DATA_TOGGLE : '[data-toggle="button"]',
  DATA_TOGGLES_BUTTONS : '[data-toggle="buttons"] .btn',
  INPUT : 'input:not([type="hidden"])',
  ACTIVE : '.active',
  BUTTON : '.btn'
}

const Event = {
  CLICK_DATA_API : `click${EVENT_KEY}${DATA_API_KEY}`,
  FOCUS_BLUR_DATA_API : `focus${EVENT_KEY}${DATA_API_KEY} ` +
                                          `blur${EVENT_KEY}${DATA_API_KEY}`,
  LOAD_DATA_API : `load${EVENT_KEY}${DATA_API_KEY}`
}

/**
 * ------------------------------------------------------------------------
 * クラス
 * ------------------------------------------------------------------------
 */

class Button {
  constructor(element) {
    this._element = element
  }

   // バージョンのゲッター

  static get VERSION() {
    return VERSION
  }

  // toggleメソッド
  toggle() {
    let triggerChangeEvent = true
    let addAriaPressed = true
    // '[data-toggle="buttons"]'をもつ要素の親要素を取得する
    const rootElement = $(this._element).closest(
      Selector.DATA_TOGGLES
    )[0]

    // rootElementがあったら
    if (rootElement) {
      // hiddenじゃないinputを取得する
      const input = this._element.querySelector(Selector.INPUT)

      // inputがあった場合
      if (input) {
        // inputがradioだった場合
        if (input.type === 'radio') {
          // .classList.contains(クラス名)が存在するか確認する
          // radioがチェックされててかつ、.activeクラスが存在する場合。
          if (input.checked &&
            this._element.classList.contains(ClassName.ACTIVE)) {
            // .activeなボタンを押したらfalseにする
            triggerChangeEvent = false
          } else {
            // .activeを持つ要素を取得する。
            const activeElement = rootElement.querySelector(Selector.ACTIVE)

            // activeElementが存在してたら
            if (activeElement) {
              // .activeクラスを削除する
              $(activeElement).removeClass(ClassName.ACTIVE)
            }
          }
        // inputがcheckboxだったら
        } else if (input.type === 'checkbox') {
          // this._elementのタグ名が<label>でかつ、.activeクラスを持っていたら
          if (this._element.tagName === 'LABEL' && input.checked === this._element.classList.contains(ClassName.ACTIVE)) {
            triggerChangeEvent = false
          }
        } else {
          // radioもしくはcheckboxじゃない場合、pointless/invalid checkedをinputに追加しちゃあかん
          triggerChangeEvent = false
        }

        // .activeクラスを持っていない場合の処理
        if (triggerChangeEvent) {
          // アクティブを持っていないか確認
          input.checked = !this._element.classList.contains(ClassName.ACTIVE)
          // input要素に対してchangeを発動
          $(input).trigger('change')
        }

        // inputにfocusを当てる
        input.focus()
        addAriaPressed = false
      }
    }

    // buttonがdisabled属性を持ってるまたは、disabledクラスを持っていた場合
    if (!(this._element.hasAttribute('disabled') || this._element.classList.contains('disabled'))) {
      // ボタンがinputじゃなかったら
      if (addAriaPressed) {
        // .activeがあったらaria-pressed属性にfalseなかったらtrue
        this._element.setAttribute('aria-pressed',
          !this._element.classList.contains(ClassName.ACTIVE))
      }

      // .activeクラスを持ってたら.activeを消す
      if (triggerChangeEvent) {
        $(this._element).toggleClass(ClassName.ACTIVE)
      }
    }
  }

    // this._elementを削除するみたい
  dispose() {
    $.removeData(this._element, DATA_KEY)
    this._element = null
  }

  // Static

  static _jQueryInterface(config) {
    return this.each(function () {
      // elementのdata-sc.buttonを取得
      let data = $(this).data(DATA_KEY)


      // dataがなかったら
      if (!data) {
        // buttonをインスタンス化
        // thisはエレメント
        data = new Button(this)
        // thisにdata-sc.alertを設定
        // 中身はボタンクラス
        $(this).data(DATA_KEY, data)
      }
      
      // configがtoggleだったら
      if (config === 'toggle') {
        // button.toggleになる
        data[config]()
      }
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(document) // click.sc.alert.data-api'と[data-toggle^="button"]'
  .on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE_CARROT, (event) => {
    // イベント対象のelement
    let button = event.target
    // イベント対象のelementが.btnを持ってたら
    if (!$(button).hasClass(ClassName.BUTTON)) {
      // .btnを持つ要素を取得する
      button = $(button).closest(Selector.BUTTON)[0]
    }

    // ボタンがない、ボタンがdisable属性またはクラスを持つ場合
    if (!button || button.hasAttribute('disabled') || button.classList.contains('disabled')) {
      // イベントを禁止にする
      event.preventDefault() // firefoxのバグで指定しないとだめみたい
    } else {
      // hidden以外のinputボタンを取得
      const inputBtn = button.querySelector(Selector.INPUT)
      // inputボタンが存在してdisabled属性またはクラスを持ってたら
      if (inputBtn && (inputBtn.hasAttribute('disabled') || inputBtn.classList.contains('disabled'))) {
        // イベントを禁止にする
        event.preventDefault() // firefoxのバグで指定しないとだめみたい
        return
      }
      // ここわかりやすい
      // https://qiita.com/Chrowa3/items/b3e2961c4930abc1369b
      Button._jQueryInterface.call($(button), 'toggle')
    }
  }) // focus.sc.alert.data-api +  blur.sc.alert.data-api'と[data-toggle^="button"]'
  .on(Event.FOCUS_BLUR_DATA_API, Selector.DATA_TOGGLE_CARROT, (event) => {
    // button要素を取得する
    const button = $(event.target).closest(Selector.BUTTON)[0]
    // button要素に対して、fucusクラスをつける
    // event,typeがfocusinならtrue、違うならfalse
    // trueなら絶対クラスを付与、falseなら削除
    $(button).toggleClass(ClassName.FOCUS, /^focus(in)?$/.test(event.type))
  })

  // load.sc.alert.data-api'
$(window).on(Event.LOAD_DATA_API, () => {
  // windowsロード時にボタンの状態を見て.activeを追加する
  // checkとかになってないのに.activeがついてたら削除する

  // data-toggle内のcheckboxとradioを見つける
  //  '[data-toggle="buttons"]をもつ .btn要素を全て取得する
  let buttons = [].slice.call(document.querySelectorAll(Selector.DATA_TOGGLES_BUTTONS))
  // buttonsの数だけループ回すよ
  for (let i = 0, len = buttons.length; i < len; i++) {
    // ボタンのi番目
    const button = buttons[i]
    // hidden以外のinputを取得
    const input = button.querySelector(Selector.INPUT)
    // inputがcheckされているか、checked属性を持っている場合
    if (input.checked || input.hasAttribute('checked')) {
      // .activeを追加する
      button.classList.add(ClassName.ACTIVE)
    } else {
      // check状態じゃなかったら削除
      button.classList.remove(ClassName.ACTIVE)
    }
  }

  //  全ての[data-toggle="button"]を取得する
  buttons = [].slice.call(document.querySelectorAll(Selector.DATA_TOGGLE))
  for (let i = 0, len = buttons.length; i < len; i++) {
    const button = buttons[i]
    // aria-pressedにtrueが指定されていたら
    if (button.getAttribute('aria-pressed') === 'true') {
      button.classList.add(ClassName.ACTIVE)
    } else {
      button.classList.remove(ClassName.ACTIVE)
    }
  }
})

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Button._jQueryInterface
$.fn[NAME].Constructor = Button
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return Button._jQueryInterface
}

export default Button
