/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.3.1): alert.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Util from './util'

const NAME                = 'alert'
const VERSION             = '0.5.2'

const DATA_KEY            = 'sc.alert'
// アラート閉じた時のイベントとかに使うみたい
// http://bootstrap3.cyberlab.info/javascript/alerts-events.html
const EVENT_KEY           = `.${DATA_KEY}`
// イベントを無効にする用
// https://getbootstrap.jp/docs/4.1/getting-started/javascript/
const DATA_API_KEY        = '.data-api'
// 他のフレームワークと名前衝突を回避する用
const JQUERY_NO_CONFLICT  = $.fn[NAME]

// アラート消す用
const Selector = {
  DISMISS : '[data-dismiss="alert"]'
}

// イベント用の名前
// e.g. close.sc.alert
const Event = {
  CLOSE          : `close${EVENT_KEY}`,
  CLOSED         : `closed${EVENT_KEY}`,
  CLICK_DATA_API : `click${EVENT_KEY}${DATA_API_KEY}`
}

// htmlのクラス名
const ClassName = {
  ALERT : 'alert',
  FADE  : 'fade',
  SHOW  : 'show'
}

class Alert {
  constructor(element) {
    this._element = element
  }

  // バージョンのゲッター
  static get VERSION() {
    return VERSION
  }

  // public method

  close(element) {
    //このクラス内のthisはalertクラス

    // コンストラクタで取得したelement
    let rootElement = this._element

    // closeにelementが引数で渡されていたら
    if (element) {
      // div.alertを取得
      rootElement = this._getRootElement(element)
    }

    //カスタムイベントを作成
    const customEvent = this._triggerCloseEvent(rootElement)

    // イベントがブラウザの処理を禁止していた場合は闇に葬り去る
    // http://www.jquerystudy.info/reference/events/isDefaultPrevented.html
    if (customEvent.isDefaultPrevented()) {
      return
    }

    // showクラスを削除する
    // fadeクラスがなかった場合、要素を削除する
    this._removeElement(rootElement)
  }

  // this._elementを削除するみたい
  dispose() {
    $.removeData(this._element, DATA_KEY)
    this._element = null
  }

  // private method

  // closeで使ってるやつ
  _getRootElement(element) {
    // elementのdata-targetもしくはhrefで指定されているselectorを取得
    const selector = Util.getSelectorFromElement(element)
    let parent     = false

    // selectorがあった場合
    if (selector) {
      // data-targetもしくはhrefで指定されている要素を取得
      // 開始タグから終了タグまで持ってくるみたい
      parent = document.querySelector(selector)
    }

    // 上のifを通らなかったか通ってもnullが帰ってきた場合
    if (!parent) {
      // data-targetもしくはhrefが指定されてないので、一番近い.alertを取得する
      parent = $(element).closest(`.${ClassName.ALERT}`)[0]
    }

    return parent
  }

  // closeで使ってるやつ
  _triggerCloseEvent(element) {
    // close.sc.alertイベントを定義
    const closeEvent = $.Event(Event.CLOSE)

    $(element).trigger(closeEvent) //closeイベントを発生
    // closeEvent返すんか
    return closeEvent
  }

  // closeで使ってるやつ
  _removeElement(element) {
    // showクラスを削除
    $(element).removeClass(ClassName.SHOW)

    // fadeクラスを持ってなかった場合
    if (!$(element).hasClass(ClassName.FADE)) {
      // アラートを削除
      this._destroyElement(element)
      return // eslint-disable-line no-useless-return
    }

    // 要素の変化にかかる時間を取得
    const transitionDuration = Util.getTransitionDurationFromElement(element)

    $(element)
      //.oneは一回だけ実行するイベント
      .one(Util.TRANSITION_END, (event) => this._destroyElement(element, event))
      .emulateTransitionEnd(transitionDuration)

  }

  // _removeElementで使ってるやつ
  _destroyElement(element) {
    $(element) // elementを。。。
      .detach() // elementを隔離
      .trigger(Event.CLOSED) // closedイベントを発生させる
      .remove() // element削除
      // https://qiita.com/BRSF/items/1aa9d154bde497b0baa0#remove%E3%81%AE%E5%A0%B4%E5%90%88
  }

  // static

  static _jQueryInterface(config) {
    return this.each(function () {
      // elementを格納
      const $element = $(this)
      // elementのdata-sc.alert属性を取得
      let data       = $element.data(DATA_KEY)

      // dataがなかったら
      if (!data) {
        // アラートをインスタンス化
        // thisはelement
        data = new Alert(this)
        // elementにdata-sc.alertを設定
        // 中身はdata
        $element.data(DATA_KEY, data)
      }

      // configがcloseだったら・・・・
      if (config === 'close') {
        // alert.close(element)になる
        data[config](this)
      }
    })
  }

  static _handleDismiss(alertInstance) {
    return function (event) {
      // イベントがあったら      
      if (event) {
        // イベントの動作を停止させる
        event.preventDefault()
      }

      // 引数で受け取ったalertインスタンスのcloseを実行
      // 引数はhtmlのbutton
      alertInstance.close(this)
    }
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Apiの定義
 * ------------------------------------------------------------------------
 */

// ここがブラウザで使う部分みたい
$(document).on(
  Event.CLICK_DATA_API, // click.sc.alert.data-api
  Selector.DISMISS, // [data-dismiss="alert"]
  Alert._handleDismiss(new Alert()) // staticのやつ実行するんだね
)

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

// .alertは_jQueryInterface
$.fn[NAME]             = Alert._jQueryInterface
// .alert.ConstructorはAlert
$.fn[NAME].Constructor = Alert

// .alert.noConflict
// 衝突回避用
$.fn[NAME].noConflict  = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return Alert._jQueryInterface
}


export default Alert
