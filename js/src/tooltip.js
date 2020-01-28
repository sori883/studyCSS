/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): tooltip.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import {
  DefaultWhitelist,
  sanitizeHtml
} from './tools/sanitizer'
import $ from 'jquery'
import Popper from 'popper.js'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'tooltip'
const VERSION = '4.4.1'
const DATA_KEY = 'sc.tooltip'
const EVENT_KEY = `.${DATA_KEY}`
const JQUERY_NO_CONFLICT = $.fn[NAME]
const CLASS_PREFIX = 'sc-tooltip'
const SCCLS_PREFIX_REGEX = new RegExp(`(^|\\s)${CLASS_PREFIX}\\S+`, 'g')
const DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn']

const DefaultType = {
  animation : 'boolean',
  template : 'string',
  title : '(string|element|function)',
  trigger : 'string',
  delay : '(number|object)',
  html : 'boolean',
  selector : '(string|boolean)',
  placement : '(string|function)',
  offset : '(number|string|function)',
  container : '(string|element|boolean)',
  fallbackPlacement : '(string|array)',
  boundary : '(string|element)',
  sanitize : 'boolean',
  sanitizeFn : '(null|function)',
  whiteList : 'object',
  popperConfig : '(null|object)'
}

const AttachmentMap = {
  AUTO : 'auto',
  TOP : 'top',
  RIGHT : 'right',
  BOTTOM : 'bottom',
  LEFT : 'left'
}

const Default = {
  animation : true,
  template : '<div class="tooltip" role="tooltip">' +
                  '<div class="arrow"></div>' +
                  '<div class="tooltip-inner"></div></div>',
  trigger : 'hover focus',
  title : '',
  delay : 0,
  html : false,
  selector : false,
  placement : 'top',
  offset : 0,
  container : false,
  fallbackPlacement : 'flip',
  boundary : 'scrollParent',
  sanitize : true,
  sanitizeFn : null,
  whiteList : DefaultWhitelist,
  popperConfig : null
}

const HoverState = {
  SHOW : 'show',
  OUT  : 'out'
}

const Event = {
  HIDE : `hide${EVENT_KEY}`,
  HIDDEN : `hidden${EVENT_KEY}`,
  SHOW : `show${EVENT_KEY}`,
  SHOWN : `shown${EVENT_KEY}`,
  INSERTED : `inserted${EVENT_KEY}`,
  CLICK : `click${EVENT_KEY}`,
  FOCUSIN : `focusin${EVENT_KEY}`,
  FOCUSOUT : `focusout${EVENT_KEY}`,
  MOUSEENTER : `mouseenter${EVENT_KEY}`,
  MOUSELEAVE : `mouseleave${EVENT_KEY}`
}

const ClassName = {
  FADE : 'fade',
  SHOW : 'show'
}

const Selector = {
  TOOLTIP : '.tooltip',
  TOOLTIP_INNER : '.tooltip-inner',
  ARROW : '.arrow'
}

const Trigger = {
  HOVER  : 'hover',
  FOCUS  : 'focus',
  CLICK  : 'click',
  MANUAL : 'manual'
}

class Tooltip {
  // elementは data-toggle="tooltip"が付与されたelement
  // configはobject(config)かfalse
  constructor(element, config) {
    // popperがなかったら、throw
    if (typeof Popper === 'undefined') {
      throw new TypeError('Simplicss\'s tooltips require Popper.js (https://popper.js.org/)')
    }

    // private
    this._isEnabled = true
    this._timeout = 0
    this._hoverState = ''
    this._activeTrigger = {}
    this._popper = null

    // Protected
    this.element = element
    this.config  = this._getConfig(config)
    this.tip     = null

    this._setListeners()
  }

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

  // Public

  enable() {
    this._isEnabled = true
  }

  disable() {
    this._isEnabled = false
  }

  toggleEnabled() {
    this._isEnabled = !this._isEnabled
  }

  toggle(event) {
    if (!this._isEnabled) {
      return
    }

    if (event) {
      const dataKey = this.constructor.DATA_KEY
      let context = $(event.currentTarget).data(dataKey)

      if (!context) {
        context = new this.constructor(
          event.currentTarget,
          this._getDelegateConfig()
        )
        $(event.currentTarget).data(dataKey, context)
      }

      context._activeTrigger.click = !context._activeTrigger.click

      if (context._isWithActiveTrigger()) {
        context._enter(null, context)
      } else {
        context._leave(null, context)
      }
    } else {
      if ($(this.getTipElement()).hasClass(ClassName.SHOW)) {
        this._leave(null, this)
        return
      }

      this._enter(null, this)
    }
  }

  dispose() {
    clearTimeout(this._timeout)

    $.removeData(this.element, this.constructor.DATA_KEY)

    $(this.element).off(this.constructor.EVENT_KEY)
    $(this.element).closest('.modal').off('hide.sc.modal', this._hideModalHandler)

    if (this.tip) {
      $(this.tip).remove()
    }

    this._isEnabled     = null
    this._timeout       = null
    this._hoverState    = null
    this._activeTrigger = null
    if (this._popper) {
      this._popper.destroy()
    }

    this._popper = null
    this.element = null
    this.config  = null
    this.tip     = null
  }

  show() {
    // 対象のElementsがdisplay:noneだったらエラーにする
    if ($(this.element).css('display') === 'none') {
      throw new Error('Please use show on visible elements')
    }

    // showEventにshow.sc.tooltipを入れる
    const showEvent = $.Event(this.constructor.Event.SHOW)

    // titleが存在していて、isEnableがtrue
    if (this.isWithContent() && this._isEnabled) {
      // element.trriger(show)。jQueryの普通のshow
      $(this.element).trigger(showEvent)

      // this,.elementに関連するshadow dowのrootを取得する
      const shadowRoot = Util.findShadowRoot(this.element)
      // jQuery.contains( 対象の要素 ,含まれているか調べたい要素 )
      const isInTheDom = $.contains(
        // shadowRootがnullじゃなかったらshadowRootが対象の要素
        // nullだった場合は、this.elementを内包するトップレベルのdocument(bodyとか)
        shadowRoot !== null ? shadowRoot : this.element.ownerDocument.documentElement,
        this.element // this.elementを探す
      )

      // showイベントがブラウザの希望を停止している
      // もしくは、this.elementがdomにない場合は停止
      if (showEvent.isDefaultPrevented() || !isInTheDom) {
        return
      }

      // tip elementの取得
      const tip   = this.getTipElement()
      // 固有IDを取得
      const tipId = Util.getUID(this.constructor.NAME)

      // tipに対して、固有のIDを設定
      tip.setAttribute('id', tipId)
      // this.elementに対して、tipIDを設定
      this.element.setAttribute('aria-describedby', tipId)
      // TODO3
      this.setContent()

      if (this.config.animation) {
        $(tip).addClass(ClassName.FADE)
      }

      const placement  = typeof this.config.placement === 'function'
        ? this.config.placement.call(this, tip, this.element)
        : this.config.placement

      const attachment = this._getAttachment(placement)
      this.addAttachmentClass(attachment)

      const container = this._getContainer()
      $(tip).data(this.constructor.DATA_KEY, this)

      if (!$.contains(this.element.ownerDocument.documentElement, this.tip)) {
        $(tip).appendTo(container)
      }

      $(this.element).trigger(this.constructor.Event.INSERTED)

      this._popper = new Popper(this.element, tip, this._getPopperConfig(attachment))

      $(tip).addClass(ClassName.SHOW)

      // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
      if ('ontouchstart' in document.documentElement) {
        $(document.body).children().on('mouseover', null, $.noop)
      }

      const complete = () => {
        if (this.config.animation) {
          this._fixTransition()
        }
        const prevHoverState = this._hoverState
        this._hoverState     = null

        $(this.element).trigger(this.constructor.Event.SHOWN)

        if (prevHoverState === HoverState.OUT) {
          this._leave(null, this)
        }
      }

      if ($(this.tip).hasClass(ClassName.FADE)) {
        const transitionDuration = Util.getTransitionDurationFromElement(this.tip)

        $(this.tip)
          .one(Util.TRANSITION_END, complete)
          .emulateTransitionEnd(transitionDuration)
      } else {
        complete()
      }
    }
  }

  hide(callback) {
    const tip       = this.getTipElement()
    const hideEvent = $.Event(this.constructor.Event.HIDE)
    const complete = () => {
      if (this._hoverState !== HoverState.SHOW && tip.parentNode) {
        tip.parentNode.removeChild(tip)
      }

      this._cleanTipClass()
      this.element.removeAttribute('aria-describedby')
      $(this.element).trigger(this.constructor.Event.HIDDEN)
      if (this._popper !== null) {
        this._popper.destroy()
      }

      if (callback) {
        callback()
      }
    }

    $(this.element).trigger(hideEvent)

    if (hideEvent.isDefaultPrevented()) {
      return
    }

    $(tip).removeClass(ClassName.SHOW)

    // If this is a touch-enabled device we remove the extra
    // empty mouseover listeners we added for iOS support
    if ('ontouchstart' in document.documentElement) {
      $(document.body).children().off('mouseover', null, $.noop)
    }

    this._activeTrigger[Trigger.CLICK] = false
    this._activeTrigger[Trigger.FOCUS] = false
    this._activeTrigger[Trigger.HOVER] = false

    if ($(this.tip).hasClass(ClassName.FADE)) {
      const transitionDuration = Util.getTransitionDurationFromElement(tip)

      $(tip)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(transitionDuration)
    } else {
      complete()
    }

    this._hoverState = ''
  }

  update() {
    if (this._popper !== null) {
      this._popper.scheduleUpdate()
    }
  }

  // Protected

  isWithContent() {
    // titleが存在しているか判定
    return Boolean(this.getTitle())
  }

  addAttachmentClass(attachment) {
    $(this.getTipElement()).addClass(`${CLASS_PREFIX}-${attachment}`)
  }

  getTipElement() {
    // this.tipはHTML elementのtooltip
    // this.config.templateは、Defaultのtooltipテンプレート
    this.tip = this.tip || $(this.config.template)[0]
    return this.tip
  }

  setContent() {
    const tip = this.getTipElement()
    this.setElementContent($(tip.querySelectorAll(Selector.TOOLTIP_INNER)), this.getTitle())
    $(tip).removeClass(`${ClassName.FADE} ${ClassName.SHOW}`)
  }

  setElementContent($element, content) {
    if (typeof content === 'object' && (content.nodeType || content.jquery)) {
      // Content is a DOM node or a jQuery
      if (this.config.html) {
        if (!$(content).parent().is($element)) {
          $element.empty().append(content)
        }
      } else {
        $element.text($(content).text())
      }

      return
    }

    if (this.config.html) {
      if (this.config.sanitize) {
        content = sanitizeHtml(content, this.config.whiteList, this.config.sanitizeFn)
      }

      $element.html(content)
    } else {
      $element.text(content)
    }
  }

  getTitle() {
    // ekementのタイトルを取得
    let title = this.element.getAttribute('data-original-title')

    // タイトルが存在しなかったら
    if (!title) {
      // this.config,titleがfunctionなら実行してその結果を返す
      // 単純にtitleがなかったらDefaultのtitleを使う
      title = typeof this.config.title === 'function'
        ? this.config.title.call(this.element)
        : this.config.title
    }

    return title
  }

  // Private

  _getPopperConfig(attachment) {
    const defaultScConfig = {
      placement: attachment,
      modifiers: {
        offset: this._getOffset(),
        flip: {
          behavior: this.config.fallbackPlacement
        },
        arrow: {
          element: Selector.ARROW
        },
        preventOverflow: {
          boundariesElement: this.config.boundary
        }
      },
      onCreate: (data) => {
        if (data.originalPlacement !== data.placement) {
          this._handlePopperPlacementChange(data)
        }
      },
      onUpdate: (data) => this._handlePopperPlacementChange(data)
    }

    return {
      ...defaultScConfig,
      ...this.config.popperConfig
    }
  }

  _getOffset() {
    const offset = {}

    if (typeof this.config.offset === 'function') {
      offset.fn = (data) => {
        data.offsets = {
          ...data.offsets,
          ...this.config.offset(data.offsets, this.element) || {}
        }

        return data
      }
    } else {
      offset.offset = this.config.offset
    }

    return offset
  }

  _getContainer() {
    if (this.config.container === false) {
      return document.body
    }

    if (Util.isElement(this.config.container)) {
      return $(this.config.container)
    }

    return $(document).find(this.config.container)
  }

  _getAttachment(placement) {
    return AttachmentMap[placement.toUpperCase()]
  }

  _setListeners() {
    // this.config.triggerを' '(半角スペース)で分割する
    // Defaultならhoverとfocusになる
    const triggers = this.config.trigger.split(' ')
    // triggerの分だけ繰り返す
    triggers.forEach((trigger) => {
      // triggerがclickだったら
      if (trigger === 'click') {
        $(this.element).on(
          // click.sc.tooltip
          this.constructor.Event.CLICK,
          // Defaultはfalse
          this.config.selector,
          (event) => this.toggle(event)
        )
      } else if (trigger !== Trigger.MANUAL) {
        // Triggerがmanualじゃなかったら。(hoverかfocus)
        // triggerがhoverか判定
        const eventIn = trigger === Trigger.HOVER
          ? this.constructor.Event.MOUSEENTER // trueはmouseenter.sc.tooltipを入れる
          : this.constructor.Event.FOCUSIN // falseはfocusin.sc.tooltipを入れる
        
        // triggerがhoverか判定
        const eventOut = trigger === Trigger.HOVER
          ? this.constructor.Event.MOUSELEAVE  // trueはmouseleave.sc.tooltipを入れる
          : this.constructor.Event.FOCUSOUT // trueはfoucusout.sc.tooltipを入れる

        $(this.element)
          .on(
            eventIn, // mouseenter.sc.tooltip
            this.config.selector, // Defaultはfalse
            (event) => this._enter(event) // TODO
          )
          .on(
            eventOut,
            this.config.selector,
            (event) => this._leave(event)
          )
      }
    })

    this._hideModalHandler = () => {
      if (this.element) {
        this.hide()
      }
    }

    $(this.element).closest('.modal').on(
      'hide.sc.modal',
      this._hideModalHandler
    )

    if (this.config.selector) {
      this.config = {
        ...this.config,
        trigger: 'manual',
        selector: ''
      }
    } else {
      this._fixTitle()
    }
  }

  _fixTitle() {
    const titleType = typeof this.element.getAttribute('data-original-title')

    if (this.element.getAttribute('title') || titleType !== 'string') {
      this.element.setAttribute(
        'data-original-title',
        this.element.getAttribute('title') || ''
      )

      this.element.setAttribute('title', '')
    }
  }

  // eventはmouseoverとかのイベント
  _enter(event, context) {
    // dataKeyにsc.tooltipを入れる
    const dataKey = this.constructor.DATA_KEY
    // event.currentTargetはtooltipが付与されているelement
    // 引数のcontextか、jQueryInterfaceでelementに入れたやつを入れる
    context = context || $(event.currentTarget).data(dataKey)

    // contextが存在しているか確認
    if (!context) {
      // contextがない場合は、tooltipのコンストラクタを読んどくみたい
      context = new this.constructor(
        // tooltipが付与されたelement
        event.currentTarget,
        // ユーザ側でconfigが設定されてたら上書きするてきな
        this._getDelegateConfig()
      )
      // tooltipが付与された要素に対して、sc.tooltipのデータキーで
      // context(tooltipのインスタンス)を入れる
      $(event.currentTarget).data(dataKey, context)
    }

    // eventが存在してたら
    if (event) {
      // event.typeがfocusinだったら、focusをtrueにする
      // focusinじゃなかったらhoverをtrueにする
      context._activeTrigger[
        event.type === 'focusin' ? Trigger.FOCUS : Trigger.HOVER
      ] = true
    }

    // div.tooltipがshowクラスを持っているもしくは、contextの_hoverStateがshowだった場合
    if ($(context.getTipElement()).hasClass(ClassName.SHOW) || context._hoverState === HoverState.SHOW) {
      // context._hoverStateにshowを入れる
      context._hoverState = HoverState.SHOW
      return
    }

    // setTimeout()を使用して設定された遅延処理を取り消す
    clearTimeout(context._timeout)
    // context._hoverStateにshowを入れる
    context._hoverState = HoverState.SHOW

    // context.config.delayが存在していなくて、delay.showが0の場合
    if (!context.config.delay || !context.config.delay.show) {
      // showを発動
      context.show()
      // 処理終了
      return
    }

    // context._timeoutにdelay.showの分だけ遅らせたshowを発動する
    context._timeout = setTimeout(() => {
      // hoverStateがshowの場合
      if (context._hoverState === HoverState.SHOW) {
        context.show()
      }
    }, context.config.delay.show)
  }

  _leave(event, context) {
    const dataKey = this.constructor.DATA_KEY
    context = context || $(event.currentTarget).data(dataKey)

    if (!context) {
      context = new this.constructor(
        event.currentTarget,
        this._getDelegateConfig()
      )
      $(event.currentTarget).data(dataKey, context)
    }

    if (event) {
      context._activeTrigger[
        event.type === 'focusout' ? Trigger.FOCUS : Trigger.HOVER
      ] = false
    }

    if (context._isWithActiveTrigger()) {
      return
    }

    clearTimeout(context._timeout)

    context._hoverState = HoverState.OUT

    if (!context.config.delay || !context.config.delay.hide) {
      context.hide()
      return
    }

    context._timeout = setTimeout(() => {
      if (context._hoverState === HoverState.OUT) {
        context.hide()
      }
    }, context.config.delay.hide)
  }

  _isWithActiveTrigger() {
    for (const trigger in this._activeTrigger) {
      if (this._activeTrigger[trigger]) {
        return true
      }
    }

    return false
  }

  // configはobject(config)かfalse
  _getConfig(config) {
    const dataAttributes = $(this.element).data()

    // dataAttributesのキーを取得してその分ループしまくる
    Object.keys(dataAttributes)
      .forEach((dataAttr) => {
        // 禁止されているdataAttrがないか存在しているか確認。
        // ['sanitize', 'whiteList', 'sanitizeFn']=['sanitize', 'whiteList', 'sanitizeFn']
        if (DISALLOWED_ATTRIBUTES.indexOf(dataAttr) !== -1) {
          // 存在している場合はそのdataAttrを削除する
          delete dataAttributes[dataAttr]
        }
      })

    config = {
      // Defaultを展開して入れる
      ...this.constructor.Default,
      // dataAttributesを展開して入れる
      ...dataAttributes,
      // configがobjectでかつ存在していたらconfigを代入
      // 上記じゃない場合は{}を代入
      ...typeof config === 'object' && config ? config : {}
    }

    // config.delayがnumberだった場合
    if (typeof config.delay === 'number') {
      config.delay = {
        // config.delayのshowとhideに
        // config.delayの値を代入
        show: config.delay,
        hide: config.delay
      }
    }

    // config.titleがnumberだった場合
    // Stringに変換する
    if (typeof config.title === 'number') {
      config.title = config.title.toString()
    }

    // config.cotentがnumberだった場合
    // Stringに変換する
    if (typeof config.content === 'number') {
      config.content = config.content.toString()
    }

    // configの各値のtypeがDefaultTypeの通りになっているか確認
    // 例えば、configのanimationの型はbooleanかどうかとか
    Util.typeCheckConfig(
      NAME,
      config,
      this.constructor.DefaultType
    )

    // config.sanitizeがtrueなら
    // Defaultはtrue
    if (config.sanitize) {
      // config.sanitizeFnはDefaultはfalse
      // config.whiteListはsanitaizer.jsのwhitelist
      config.template = sanitizeHtml(config.template, config.whiteList, config.sanitizeFn)
    }

    // configを返す
    return config
  }

  _getDelegateConfig() {
    const config = {}

    if (this.config) {
      //tooltipのconfigのkey分だけfor
      for (const key in this.config) {
        // Defaultのkeyの値と、thiss.configのkeyの値が不一致だったら
        if (this.constructor.Default[key] !== this.config[key]) {
          // configのkeyに、this.configのkeyの値を入れる
          config[key] = this.config[key]
        }
      }
    }

    return config
  }

  _cleanTipClass() {
    const $tip = $(this.getTipElement())
    const tabClass = $tip.attr('class').match(SCCLS_PREFIX_REGEX)
    if (tabClass !== null && tabClass.length) {
      $tip.removeClass(tabClass.join(''))
    }
  }

  _handlePopperPlacementChange(popperData) {
    const popperInstance = popperData.instance
    this.tip = popperInstance.popper
    this._cleanTipClass()
    this.addAttachmentClass(this._getAttachment(popperData.placement))
  }

  _fixTransition() {
    const tip = this.getTipElement()
    const initConfigAnimation = this.config.animation

    if (tip.getAttribute('x-placement') !== null) {
      return
    }

    $(tip).removeClass(ClassName.FADE)
    this.config.animation = false
    this.hide()
    this.show()
    this.config.animation = initConfigAnimation
  }

  // Static

  // 引数はtooltip({container: $('#customContainer')[0]})とかのオブジェクト
  // あと、tooltip('show')のshowとか
  static _jQueryInterface(config) {

    return this.each(function () {
      // $('#target').tooltipみたいな形な記述があればtooltipが入る
      // その時、configに指定された値が入る。placement : 'top'とか
      let data = $(this).data(DATA_KEY)

      // configがobjectならobjectを_configに入れる
      // それ以外(undefinedとかshowとか)ならfalseを入れる
      const _config = typeof config === 'object' && config

      // dataがundefinedで、configがdisposeまたは、hideにマッチする場合
      // 処理を終了する
      if (!data && /dispose|hide/.test(config)) {
        return
      }

      // dataがundefinedの場合
      if (!data) {
        // dataにインスタンス化したTooltipを入れる
        // thisはdata-toggle="tooltip"が指定されてるelements
        // _configはfalseかobject
        data = new Tooltip(this, _config)
        // elementsに対して、sc.tooltipって名前でdata(tooltipのインスタンス)
        // を設定する
        $(this).data(DATA_KEY, data)
      }

      // configがstringの場合(showとか)
      if (typeof config === 'string') {
        // tooltipsにconfigと同じ名前のメソッドがあるか判定
        // 存在しない場合は、ないよっていう
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        // throwされなかった場合は、configと同じ名前のメソッドを実行する
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

$.fn[NAME] = Tooltip._jQueryInterface
$.fn[NAME].Constructor = Tooltip
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return Tooltip._jQueryInterface
}

export default Tooltip
