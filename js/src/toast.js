/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): toast.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'toast'
const VERSION = '4.4.1'
const DATA_KEY = 'sc.toast'
const EVENT_KEY = `.${DATA_KEY}`
const JQUERY_NO_CONFLICT = $.fn[NAME]

const Event = {
  CLICK_DISMISS : `click.dismiss${EVENT_KEY}`,
  HIDE : `hide${EVENT_KEY}`,
  HIDDEN : `hidden${EVENT_KEY}`,
  SHOW : `show${EVENT_KEY}`,
  SHOWN : `shown${EVENT_KEY}`
}

const ClassName = {
  FADE : 'fade',
  HIDE : 'hide',
  SHOW : 'show',
  SHOWING : 'showing'
}

const DefaultType = {
  animation : 'boolean',
  autohide : 'boolean',
  delay : 'number'
}

const Default = {
  animation : true,
  autohide : true,
  delay : 500
}

const Selector = {
  DATA_DISMISS : '[data-dismiss="toast"]'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Toast {
  // elementはtoast要素
  // configはそれがobjectかのtrueかfalse
  constructor(element, config) {
    this._element = element
    this._config  = this._getConfig(config)
    this._timeout = null
    // toast要素クリック時にdata-dismiss='toast'を持つ要素をhideするイベントを定義
    this._setListeners()
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  static get DefaultType() {
    return DefaultType
  }

  static get Default() {
    return Default
  }

  // Public

  show() {
    // showイベントを定義
    const showEvent = $.Event(Event.SHOW)

    // showイベントを発動
    $(this._element).trigger(showEvent)
    // showイベントがブラウザのデフォルト動作を禁止していたら処理終了
    if (showEvent.isDefaultPrevented()) {
      return
    }

    // animationがtrueの場合(Defaulrはtrue)
    if (this._config.animation) {
      // toast要素に.fadeを追加
      this._element.classList.add(ClassName.FADE)
    }

    // 処理完了時の関数を定義
    const complete = () => {
      // toast要素から.showingを削除
      this._element.classList.remove(ClassName.SHOWING)
      // .showを付与
      this._element.classList.add(ClassName.SHOW)

      // shownイベントを実行
      $(this._element).trigger(Event.SHOWN)

      // autohideがtrueの場合(Defaultはtrue)
      if (this._config.autohide) {
        // delayだけ送らせてhideを実行(Defaultは500)
        this._timeout = setTimeout(() => {
          this.hide()
        }, this._config.delay)
      }
    }

    // .hideを削除
    this._element.classList.remove(ClassName.HIDE)
    // taost要素の高さを取得
    Util.reflow(this._element)
    // .showingを付与
    this._element.classList.add(ClassName.SHOWING)
    // animetionがtrueの場合
    if (this._config.animation) {
      // toast要素の遷移時間を取得
      const transitionDuration = Util.getTransitionDurationFromElement(this._element)

      // 遷移時間だけ送らせてcomplete関数を実行
      $(this._element)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(transitionDuration)
    } else {
      // animetionがfalseの場合は即実行
      complete()
    }
  }

  hide() {
    // toast要素が.showを持っていた場合は処理終了
    if (!this._element.classList.contains(ClassName.SHOW)) {
      return
    }

    // hideイベントを定義
    const hideEvent = $.Event(Event.HIDE)

    // hideイベントを実行
    $(this._element).trigger(hideEvent)
    // hideイベントがブラウザの処理を停止していたら処理終了
    if (hideEvent.isDefaultPrevented()) {
      return
    }

    // closeを実行
    this._close()
  }

  dispose() {
    // timeoutを削除
    clearTimeout(this._timeout)
    this._timeout = null

    // toast要素が.showを持っていたら削除する
    if (this._element.classList.contains(ClassName.SHOW)) {
      this._element.classList.remove(ClassName.SHOW)
    }

    // クリック時に非表示にするイベントを削除
    $(this._element).off(Event.CLICK_DISMISS)

    // toast要素を削除する
    $.removeData(this._element, DATA_KEY)
    this._element = null
    this._config  = null
  }

  // Private

  _getConfig(config) {
    config = {
      ...Default, // Default変数を設定
      ...$(this._element).data(), // toast要素に指定されているdata-属性の値で上書き
      ...typeof config === 'object' && config ? config : {} // objectで上書き。falseの場合は、なにもせん
    }

    // configの値が、DefaultTypeの型と一致しているか確認
    Util.typeCheckConfig(
      NAME,
      config,
      this.constructor.DefaultType
    )

    // configを返す
    return config
  }

  _setListeners() {
    // toast要素クリック時にdata-dismiss='toast'を持つ要素をhideする
    $(this._element).on(
      Event.CLICK_DISMISS, // click.dismiss
      Selector.DATA_DISMISS, // data-dismiss='toast'
      () => this.hide() // hideする
    )
  }

  _close() {
    // 関数定義
    const complete = () => {
      this._element.classList.add(ClassName.HIDE) // toast要素に.hideを追加
      $(this._element).trigger(Event.HIDDEN) // hiddenイベントを実行
    }

    // toast要素から.showを削除
    this._element.classList.remove(ClassName.SHOW)
    // animetionがtrueの場合(Defaultはtrue)
    if (this._config.animation) {
      // toast要素の遷移時間を取得
      const transitionDuration = Util.getTransitionDurationFromElement(this._element)

      // toast要素の遷移時間後に、complete関数を実行
      $(this._element)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(transitionDuration)
    } else {
      // animationがfalseならすぐに実行
      complete()
    }
  }

  // Static

  static _jQueryInterface(config) {
    // thisはtoast要素
    // configは$('.toast').toast('show')のshow部分

    // toast要素の数だけ処理を行う
    return this.each(function () {
      // toast要素を格納
      const $element = $(this)
      // toast要素にDATAが設定されているか確認
      let data = $element.data(DATA_KEY)
      // configがobjectか判定してする
      // objectの場合は、objectをそのまま入れる
      // objectじゃない場合は、false
      const _config  = typeof config === 'object' && config

      // dataが存在していない場合
      if (!data) {
        // toast要素と_configを引数にtoastをインスタンス化する
        // thisはtoast要素
        data = new Toast(this, _config)
        // toast要素にToastインスタンスを紐付け
        $element.data(DATA_KEY, data)
      }

      // configがstringの場合
      if (typeof config === 'string') {
        // Toastにconfigと同じ名前の引数が存在しない場合はエラー
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        // Toastのメソッドを実行
        data[config](this)
      }
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Toast._jQueryInterface
$.fn[NAME].Constructor = Toast
$.fn[NAME].noConflict  = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return Toast._jQueryInterface
}

export default Toast
