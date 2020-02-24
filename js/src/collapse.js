/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): collapse.js
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

const NAME = 'collapse'
const VERSION = '4.4.1'
const DATA_KEY = 'sc.collapse'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]

const Default = {
  toggle : true,
  parent : ''
}

const DefaultType = {
  toggle : 'boolean',
  parent : '(string|element)'
}

const Event = {
  SHOW : `show${EVENT_KEY}`,
  SHOWN : `shown${EVENT_KEY}`,
  HIDE : `hide${EVENT_KEY}`,
  HIDDEN : `hidden${EVENT_KEY}`,
  CLICK_DATA_API : `click${EVENT_KEY}${DATA_API_KEY}`
}

const ClassName = {
  SHOW : 'show',
  COLLAPSE : 'collapse',
  COLLAPSING : 'collapsing',
  COLLAPSED  : 'collapsed'
}

const Dimension = {
  WIDTH : 'width',
  HEIGHT : 'height'
}

const Selector = {
  ACTIVES : '.show, .collapsing',
  DATA_TOGGLE : '[data-toggle="collapse"]'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Collapse {
  constructor(element, config) {
    this._isTransitioning = false
    this._element = element
    // cofigを取得
    this._config = this._getConfig(config)
    // data-toggle="collapse"を持っていて、hrefもしくはdata-targetを持ってる要素を取得する
    this._triggerArray = [].slice.call(document.querySelectorAll(
      `[data-toggle="collapse"][href="#${element.id}"],` +
      `[data-toggle="collapse"][data-target="#${element.id}"]`
    ))

    // [data-toggle="collapse"]を持つ要素を全て取得する
    const toggleList = [].slice.call(document.querySelectorAll(Selector.DATA_TOGGLE))
    // 取得した[data-toggle="collapse"]を持つ要素の数だけループする
    for (let i = 0, len = toggleList.length; i < len; i++) {
      // [data-toggle="collapse"]要素を取り出す
      const elem = toggleList[i]
      // elemのhrefで指定した値を取得
      const selector = Util.getSelectorFromElement(elem)
      // セレクターで指定された(クリックされた)要素で指定されているhrefのelementを取得
      const filterElement = [].slice.call(document.querySelectorAll(selector))
        .filter((foundElem) => foundElem === element)

      // selectorが存在していて、filterElementも存在していた場合
      if (selector !== null && filterElement.length > 0) {
        // this._selectorにselector(hrefの値)を入れる
        this._selector = selector
        // this._triggerArrayにelem([data-toggle="collapse"]を持つ要素)を入れる
        this._triggerArray.push(elem)
      }
    }

    // this._config.parentが存在していたらgetParentを実行する
    // 存在していなかったnullを入れる
    this._parent = this._config.parent ? this._getParent() : null

    // config.parentが存在していなかったら
    if (!this._config.parent) {
      // 開閉する要素が.showを持っているかによって
      // trigger要素に.collapsedとaria-expanded属性を付与したり削除したりする
      this._addAriaAndCollapsedClass(this._element, this._triggerArray)
    }

    // cofig.toggleがtrueだった場合
    if (this._config.toggle) {
      // Collapse.toggleを実行
      this.toggle()
    }
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  static get Default() {
    return Default
  }

  // Public

  toggle() {
    // this._elementは開閉する要素
    // その要素がshowを持っている場合
    if ($(this._element).hasClass(ClassName.SHOW)) {
      // hideを実行
      this.hide()
    } else {
      // showを持っていない場合はshowを実行
      this.show()
    }
  }

  show() {
    // this._isTransitioningがtrueもしくは、開閉対象の要素がshowを持っていたら
    // 処理を終了する
    if (this._isTransitioning ||
      $(this._element).hasClass(ClassName.SHOW)) {
      return
    }

    let actives
    let activesData

    // this._parentが存在していたら
    if (this._parent) {
      // parentから.showか.collapsingを持つ要素を取得する
      actives = [].slice.call(this._parent.querySelectorAll(Selector.ACTIVES))
        .filter((elem) => {
          // this._config.parent要素がstringの場合
          if (typeof this._config.parent === 'string') {
            // .activesの要素でdata-parent属性がthis._config.parentもののみを取得
            return elem.getAttribute('data-parent') === this._config.parent
          }
          // this._config.parent要素がstring以外の場合
          // elemのクラスリストにcollapseが存在するもののみを取得
          return elem.classList.contains(ClassName.COLLAPSE)
        })

      // activesに要素が存在していない場合は、nullを代入する
      if (actives.length === 0) {
        actives = null
      }
    }

    // activesがnullじゃない場合
    if (actives) {
      // activesからクリックされたtrigger要素のhrefで指定された要素を削除
      // 削除後に残ったactivesからDATA_KEYの値を取得する
      activesData = $(actives).not(this._selector).data(DATA_KEY)
      // activesDataが存在していて、activesData._isTransitioningがtrueなら
      // 処理終了
      if (activesData && activesData._isTransitioning) {
        return
      }
    }

    // showイベントを定義
    const startEvent = $.Event(Event.SHOW)
    // showイベントを発動
    $(this._element).trigger(startEvent)
    // showイベントがブラウザのデフォルト動作を禁止していたら処理終了
    if (startEvent.isDefaultPrevented()) {
      return
    }

    // activesが存在する場合
    if (actives) {
      // activesからthis._selectorで指定された要素を削除して、jQueryInterfaceでhideを実行
      // つまり、showするのと同時に既に開いている要素を閉じる
      Collapse._jQueryInterface.call($(actives).not(this._selector), 'hide')
      // activeDataが存在しない場合
      if (!activesData) {
        // activesにDATA_KEYでnullを設定
        $(actives).data(DATA_KEY, null)
      }
    }

    // this._elementが.widthを持っていたらwidthを取得
    // もっていなかったらheightを取得
    const dimension = this._getDimension()

    // this._element(開閉される要素)から.collapseを削除
    // そして、.collapsingを付与
    $(this._element)
      .removeClass(ClassName.COLLAPSE)
      .addClass(ClassName.COLLAPSING)
    
    // 開閉対象の高さを0pxにする
    this._element.style[dimension] = 0

    // [data-toggle="collapse"]を持つ要素が0じゃない場合
    if (this._triggerArray.length) {
      // _triggerArrayの.collapsedを削除
      // aria-expandedをtrueで設定
      $(this._triggerArray)
        .removeClass(ClassName.COLLAPSED)
        .attr('aria-expanded', true)
    }

    // this._isTransitioningにtrueを設定
    this.setTransitioning(true)

    const complete = () => {
      // ここでshowをしている。詳細は_transitions.scssを確認だけど
      // 単純に.showを持っていない.collapse要素はdisplay:none;している
      // .collapsingを削除し、.collapseと.showを付与
      $(this._element)
        .removeClass(ClassName.COLLAPSING)
        .addClass(ClassName.COLLAPSE)
        .addClass(ClassName.SHOW)

      // 0に設定したstyleを空にする
      this._element.style[dimension] = ''
      
      // this._isTransitioningにfalseを設定
      this.setTransitioning(false)

      // shownイベントを発動
      $(this._element).trigger(Event.SHOWN)
    }

    // dimensionの1文字目を大文字にする
    const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1)
    const scrollSize = `scroll${capitalizedDimension}`
    // 開閉する要素の遷移時間を取得
    const transitionDuration = Util.getTransitionDurationFromElement(this._element)

    // 開閉する要素
    $(this._element)
      .one(Util.TRANSITION_END, complete) // 一度だけ発動するcomplete
      .emulateTransitionEnd(transitionDuration) // ここでTRANTION_ENDをtriggerしてる

    // this._elementのdimensionスタイルに、scrollSize分の値を適用する
    this._element.style[dimension] = `${this._element[scrollSize]}px`
  }

  hide() {
        // this._isTransitioningがtrueもしくは、開閉対象の要素がshowを持っていなかったら
    // 処理を終了する
    if (this._isTransitioning ||
      !$(this._element).hasClass(ClassName.SHOW)) {
      return
    }

    // hideイベントを定義する
    const startEvent = $.Event(Event.HIDE)
    // hideイベントを発動する
    $(this._element).trigger(startEvent)
    // hideイベントがブラウザの動作を停止していたら処理終了
    if (startEvent.isDefaultPrevented()) {
      return
    }

    // this._elementが.widthを持っていたらwidthを取得
    // もっていなかったらheightを取得
    const dimension = this._getDimension()

    // getBoundingClientRectは要素の位置を取得する
    // つまり、開閉要素の位置(dimensionでheightかwidthを指定)を取得して
    // 開閉要素のスタイルに指定する
    this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`

    // 開閉要素の高さを取得する
    // heightとpaddingとborderの合計値
    Util.reflow(this._element)

    // 開閉要素に.collapsingを追加する
    // .collapseと.showは削除する
    $(this._element)
      .addClass(ClassName.COLLAPSING)
      .removeClass(ClassName.COLLAPSE)
      .removeClass(ClassName.SHOW)

    // trigger要素の長さを取得
    const triggerArrayLength = this._triggerArray.length
    // triggerArrayLengthが1以上だったら
    if (triggerArrayLength > 0) {
      // triggerArrayLengthの長さの分だけループする
      for (let i = 0; i < triggerArrayLength; i++) {
        // triggerArrayのひとつを取得
        const trigger = this._triggerArray[i]
        // triggerに指定されている開閉要素を取得する
        const selector = Util.getSelectorFromElement(trigger)

        // selectorが存在していたら
        if (selector !== null) {
          // 開閉要素を全て取得して、配列で入れる
          const $elem = $([].slice.call(document.querySelectorAll(selector)))
          // 開閉要素がshowを持っていない場合
          if (!$elem.hasClass(ClassName.SHOW)) {
            // trrigerに.collapsedを追加する
            $(trigger).addClass(ClassName.COLLAPSED)
              // aria-expanded属性をfalseにする
              .attr('aria-expanded', false)
          }
        }
      }
    }

    // this._isTransitioningをtrueにする
    this.setTransitioning(true)

    const complete = () => {
      // this._isTransitioningをfalseにする
      this.setTransitioning(false)
      $(this._element)
        .removeClass(ClassName.COLLAPSING)
        .addClass(ClassName.COLLAPSE)
        .trigger(Event.HIDDEN)
    }

    this._element.style[dimension] = ''
    const transitionDuration = Util.getTransitionDurationFromElement(this._element)

    $(this._element)
      .one(Util.TRANSITION_END, complete)
      .emulateTransitionEnd(transitionDuration)
  }

  setTransitioning(isTransitioning) {
    // this._isTransitioningに引数を設定
    // trueかfalse
    this._isTransitioning = isTransitioning
  }

  dispose() {
    $.removeData(this._element, DATA_KEY)

    this._config          = null
    this._parent          = null
    this._element         = null
    this._triggerArray    = null
    this._isTransitioning = null
  }

  // Private

  // configを取得する
  _getConfig(config) {
    // configにDefaultの値と、configの値を展開して入れる
    config = {
      ...Default,
      ...config
    }
    config.toggle = Boolean(config.toggle) // Stringをbooleanに変換する
    // confignの値がDefaultTypeの型と一致しているか確認
    Util.typeCheckConfig(NAME, config, DefaultType)
    // configを返す
    return config
  }

  _getDimension() {
    // this._elementは開閉要素
    // this._elementが.widthを持っているか判定
    const hasWidth = $(this._element).hasClass(Dimension.WIDTH)
    // .widthが存在していたらwidthを返す
    // .widthが存在していなかったらheightを返す
    return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT
  }

  _getParent() {
    let parent

    // this._config.parentがElementか判定する
    if (Util.isElement(this._config.parent)) {
      // Elementだった場合そのまま格納
      parent = this._config.parent

      // jQuery object
      // this._config.parent.jqueryがundefinedじゃない場合
      if (typeof this._config.parent.jquery !== 'undefined') {
        // elementを格納
        parent = this._config.parent[0]
      }
    } else {
      // this._config.parentがElementじゃない場合
      // this._config.parentに指定されている要素を探して格納
      parent = document.querySelector(this._config.parent)
    }

    // [data-toggle="collapse"][data-parent="#accordion"]みたいになる
    const selector =
      `[data-toggle="collapse"][data-parent="${this._config.parent}"]`

    // parent要素の中からselectorとマッチする要素を取得する
    // data-toggleとdata-parent両方持っている要素のみ
    const children = [].slice.call(parent.querySelectorAll(selector))
  
    // elementはselectorと一致した要素
    $(children).each((i, element) => {
      // 開閉する要素が.showを持っているかによって
      // trigger要素に.collapsedとaria-expanded属性を付与したり削除したりする
      this._addAriaAndCollapsedClass(
        Collapse._getTargetFromElement(element), // hrefとかに指定されている要素
        [element] // data-toggleとdata-parent両方持っている要素
      )
    })

    // data-parent属性に指定された親要素を返す
    return parent
  }

  // elementはhrefとかに指定されている開閉する要素
  // triggerArrayはelementを開閉させるためにクリックする要素
  _addAriaAndCollapsedClass(element, triggerArray) {
    // elementがshowを持っているか判定
    const isOpen = $(element).hasClass(ClassName.SHOW)

    // triggerArrayに要素が入っているか判定
    if (triggerArray.length) {
      // elementがshowを持っていた場合は.collapsedを削除
      // elementがshowを持っていない場合は.collapsedを付与
      // aria-expanded属性にisOpenの値を設定
      $(triggerArray)
        .toggleClass(ClassName.COLLAPSED, !isOpen)
        .attr('aria-expanded', isOpen)
    }
  }

  // Static

  // elementはdata-toggleとdata-parent両方持っている要素
  static _getTargetFromElement(element) {
    // elementが持ってるhrefやdata-targetに指定されているselectorを取得
    const selector = Util.getSelectorFromElement(element)
    // selectorが存在していたら、selectorに指定されている要素を取得して返す
    // なかったらnullを返す
    return selector ? document.querySelector(selector) : null
  }

  static _jQueryInterface(config) {
    return this.each(function () {
      // selectorの要素(開閉する要素)
      const $this = $(this)
      // $thisのDATA_KEYと結びつくdata取得
      let data = $this.data(DATA_KEY)
      // configを格納
      const _config = {
        ...Default,
        ...$this.data(), // data-parent="#accordion"を取得することで_config.parentが生成される
        // configがobjectかつ存在していたらconfigを返す。
        // それ以外なら空配列を返す
        ...typeof config === 'object' && config ? config : {}
      }

      // dataが存在していないかつ、_config.toggleがtrue
      // configがshowまたはhideだった場合
      if (!data && _config.toggle && /show|hide/.test(config)) {
        // toggleをfalseにする
        _config.toggle = false
      }

      // dataが存在してなかったらdataをインスタンス化する
      // インスタンス化したdataはDATA_KEYでElementに設定する
      if (!data) {
        // thisはdata-toggle="collapse"を持つ要素
        // _configは上で設定した_config
        data = new Collapse(this, _config)
        $this.data(DATA_KEY, data)
      }

      // configがstringだった場合
      if (typeof config === 'string') {
        // configメソッドがdata(collapseクラス)にあるか確認する
        if (typeof data[config] === 'undefined') {
          // なかったらエラーを返す
          throw new TypeError(`No method named "${config}"`)
        }
        // 存在していたら実行
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
// DATA_TOGGLEに対して、クリックイベントを定義する
$(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
  // 折りたたみ可能な要素な要素ないではなく、<a>要素（URLを変更する）に対してのみ動作を停止する
  if (event.currentTarget.tagName === 'A') {
    event.preventDefault()
  }

  // thisはクリックしたelement(イベント要素)
  const $trigger = $(this)
  // セレクタを取得(#collapseOneとか)
  const selector = Util.getSelectorFromElement(this)
  // セレクタで指定された要素を取得
  const selectors = [].slice.call(document.querySelectorAll(selector))

  $(selectors).each(function () {
    // selectorで指定されているtoggleする要素
    const $target = $(this)
    // targetのDATA_KEYを取得する
    const data = $target.data(DATA_KEY)
    // configとdataが一致していたら$trigger.data()を入れる
    // それ以外の場合はtoggleを入れる
    // $trigger.data()は<a>のdata-toggleの値を取得する
    const config  = data ? 'toggle' : $trigger.data()
    
    // jqueryInterfaceを呼ぶ
    Collapse._jQueryInterface.call($target, config)
  })
})

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Collapse._jQueryInterface
$.fn[NAME].Constructor = Collapse
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return Collapse._jQueryInterface
}

export default Collapse
