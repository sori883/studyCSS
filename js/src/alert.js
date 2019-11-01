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
    // コンストラクタで取得したelement
    let rootElement = this._element

    // closeにelementが引数で渡されていたら
    if (element) {
      // data-targetもしくはhrefで指定された要素を取得
      // data-targetもしくはhrefがなかったら直近の.alert要素を取得
      rootElement = this._getRootElement(element)
    }

    //
    const customEvent = this._triggerCloseEvent(rootElement)

    if (customEvent.isDefaultPrevented()) {
      return
    }

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
    // $.close.sc.alertになるんだなぁ
    const closeEvent = $.Event(Event.CLOSE)

    $(element).trigger(closeEvent)
    return closeEvent
  }

}

export default Alert
