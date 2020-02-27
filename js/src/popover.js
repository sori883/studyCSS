/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): popover.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Tooltip from './tooltip'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'popover'
const VERSION = '4.4.1'
const DATA_KEY = 'sc.popover'
const EVENT_KEY = `.${DATA_KEY}`
const JQUERY_NO_CONFLICT = $.fn[NAME]
const CLASS_PREFIX = 'sc-popover'
const SCCLS_PREFIX_REGEX = new RegExp(`(^|\\s)${CLASS_PREFIX}\\S+`, 'g')

const Default = {
  ...Tooltip.Default,
  placement : 'right',
  trigger : 'click',
  content : '',
  template : '<div class="popover" role="tooltip">' +
              '<div class="arrow"></div>' +
              '<h3 class="popover-header"></h3>' +
              '<div class="popover-body"></div></div>'
}

const DefaultType = {
  ...Tooltip.DefaultType,
  content : '(string|element|function)'
}

const ClassName = {
  FADE : 'fade',
  SHOW : 'show'
}

const Selector = {
  TITLE : '.popover-header',
  CONTENT : '.popover-body'
}

const Event = {
  HIDE : `hide${EVENT_KEY}`,
  HIDDEN : `hidden${EVENT_KEY}`,
  SHOW : `show${EVENT_KEY}`,
  SHOWN : `shown${EVENT_KEY}`,
  INSERTED  : `inserted${EVENT_KEY}`,
  CLICK : `click${EVENT_KEY}`,
  FOCUSIN : `focusin${EVENT_KEY}`,
  FOCUSOUT : `focusout${EVENT_KEY}`,
  MOUSEENTER : `mouseenter${EVENT_KEY}`,
  MOUSELEAVE : `mouseleave${EVENT_KEY}`
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

// Tooltipを継承するみたい
class Popover extends Tooltip {
  // Getters

  static get VERSION() {
    return VERSION
  }

  static get Default() {
    return Default
  }

  static get NAME() {
    return NAME
  }

  static get DATA_KEY() {
    return DATA_KEY
  }

  static get Event() {
    return Event
  }

  static get EVENT_KEY() {
    return EVENT_KEY
  }

  static get DefaultType() {
    return DefaultType
  }

  // Overrides
  // tooltipのメソッドを書き換える

  // 存在した場合はtooltipのshowを継続する
  isWithContent() {
    // 存在する方のみ返す
    return this.getTitle() || this._getContent()
  }


  addAttachmentClass(attachment) {
    // popoverのCLASS_PREFIXが使われるようにする
    $(this.getTipElement()).addClass(`${CLASS_PREFIX}-${attachment}`)
  }

  getTipElement() {
    // ここで、オーバライドしているのはpopoverの$(this.config.template)[0]を使うため
    this.tip = this.tip || $(this.config.template)[0]
    return this.tip
  }

  setContent() {
    // tipのelementを取得する
    const $tip = $(this.getTipElement())

    // jsイベントを維持するために、htmlにappendを使用する
    // .popover-headerと['data-original-title']属性のタイトルが引数
    // .popover-headerにthis.getTitle()で取得したテキストを設定する
    this.setElementContent($tip.find(Selector.TITLE), this.getTitle())
    // ['data-content']属性の値を取得
    let content = this._getContent()
    // コンテンツがfunctionの場合
    if (typeof content === 'function') {
      // this.elementに対してcontent関数を実行し、その結果をコンテンツに格納する
      content = content.call(this.element)
    }
    // .popover-bodyに対して、contentのテキストを設定する
    this.setElementContent($tip.find(Selector.CONTENT), content)

    // tipのfadeクラスとshowクラスを削除する
    $tip.removeClass(`${ClassName.FADE} ${ClassName.SHOW}`)
  }

  // Private

  _getContent() {
    // ['data-content']属性が存在していた場合は、その値を返す
    // 存在しなかった場合はconfig.contentを返す
    return this.element.getAttribute('data-content') ||
      this.config.content
  }

  _cleanTipClass() {
    // tipの要素を取得
    const $tip = $(this.getTipElement())
    // tipに.sc-popoverに関連クラスがあるか確認する
    const tabClass = $tip.attr('class').match(SCCLS_PREFIX_REGEX)
    // tabClassが存在していて、tabClassの長さが0以上の場合
    if (tabClass !== null && tabClass.length > 0) {
      // TabClassに該当するクラスを全て削除する
      $tip.removeClass(tabClass.join(''))
    }
  }

  // Static

  static _jQueryInterface(config) {
    return this.each(function () {
      // thisはdata-toggle="popover"を持った要素
      // その要素から、DATA_KEYの値を取得する
      let data = $(this).data(DATA_KEY)
      // configがibjectなら、_configに代入する
      // オブジェクトじゃないならnullを代入する
      const _config = typeof config === 'object' ? config : null

      // dataが存在していなくて、disposeとhideがconfigに含まれている場合
      if (!data && /dispose|hide/.test(config)) {
        return
      }

      // dataが存在しない場合
      if (!data) {
        // dataをインスタンス化する
        // thisはdata-toggle="popover"を持った要素
        // _configはobjectかnull
        data = new Popover(this, _config)
        // popover要素にDATA_KEY名でPopoverのインスタンスを設定する
        $(this).data(DATA_KEY, data)
      }

      // dataがあった場合
      // configがstringの場合
      if (typeof config === 'string') {
        // Popoverにconfigと同じ名前のメソッドがあるか判定する
        if (typeof data[config] === 'undefined') {
          // 存在しない場合は、エラー
          throw new TypeError(`No method named "${config}"`)
        }
        // 存在した場合は実行する
        data[config]()
      }
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Popover._jQueryInterface
$.fn[NAME].Constructor = Popover
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return Popover._jQueryInterface
}

export default Popover
