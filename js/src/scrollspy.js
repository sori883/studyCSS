/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): scrollspy.js
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

const NAME = 'scrollspy'
const VERSION = '4.4.1'
const DATA_KEY = 'sc.scrollspy'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]

const Default = {
  offset : 10,
  method : 'auto',
  target : ''
}

const DefaultType = {
  offset : 'number',
  method : 'string',
  target : '(string|element)'
}

const EVENT_ACTIVATE = `activate${EVENT_KEY}`
const EVENT_SCROLL = `scroll${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item'
const CLASS_NAME_ACTIVE = 'active'

const SELECTOR_DATA_SPY = '[data-spy="scroll"]'
const SELECTOR_NAV_LIST_GROUP  = '.nav, .list-group'
const SELECTOR_NAV_LINKS = '.nav-link'
const SELECTOR_NAV_ITEMS = '.nav-item'
const SELECTOR_LIST_ITEMS = '.list-group-item'
const SELECTOR_DROPDOWN = '.dropdown'
const SELECTOR_DROPDOWN_ITEMS  = '.dropdown-item'
const SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle'

const METHOD_OFFSET = 'offset'
const METHOD_POSITION = 'position'

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class ScrollSpy {
  // elementはdata-spy="scroll"要素
  constructor(element, config) {
    this._element = element
    // elementがbody要素だった場合はwindowを格納
    // bodyじゃない場合は、elementを格納
    this._scrollElement = element.tagName === 'BODY' ? window : element
    this._config = this._getConfig(config) // configの格納と、config.targetにuidを設定
    // selectorにconfig.targetと各selectorを設定
    this._selector = `${this._config.target} ${SELECTOR_NAV_LINKS},` +
                            `${this._config.target} ${SELECTOR_LIST_ITEMS},` +
                            `${this._config.target} ${SELECTOR_DROPDOWN_ITEMS}`
    this._offsets = []
    this._targets = []
    this._activeTarget = null
    this._scrollHeight = 0

    // scrollElementにscrollイベントを定義
    $(this._scrollElement).on(EVENT_SCROLL, (event) => this._process(event))

    // target要素(切り替わる要素のhrefで指定されている要素)の位置を取得
    // this._offsetsとthis._targetsにpush
    this.refresh()

    this._process()
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  static get Default() {
    return Default
  }

  // Public

  refresh() {
    // scrollElementがwindowの場合は、'offset'を格納
    // windowじゃない場合は'postion'を格納
    // windowのときはoffsetをする(offsetはwindowからの位置)
    // windowじゃないときはpositionをする(positionは親要素からの位置)
    const autoMethod = this._scrollElement === this._scrollElement.window
      ? METHOD_OFFSET : METHOD_POSITION

    // config.methodが'auto'の場合(Defaultはauto)は、autoMethodを格納する
    // autoじゃない場合は、config,methodを格納
    const offsetMethod = this._config.method === 'auto'
      ? autoMethod : this._config.method

    // offsetMethodが'position'だった場合はスクロール要素内のスクロール量を取得
    // positionじゃない場合は、0を格納
    const offsetBase = offsetMethod === METHOD_POSITION
      ? this._getScrollTop() : 0

    // offsetsとtargetsを初期化
    this._offsets = []
    this._targets = []

    // scroll要素の高さを取得
    this._scrollHeight = this._getScrollHeight()

    // selector要素を全部取得する
    const targets = [].slice.call(document.querySelectorAll(this._selector))

    targets
      .map((element) => {
        // elementはselector
        let target
        // selectorの、href要素の値を取得
        const targetSelector = Util.getSelectorFromElement(element)

        // targetSelectorがnullじゃない場合
        if (targetSelector) {
          // hrefで指定された要素を取得(selectorのhrefで指定されている要素)
          target = document.querySelector(targetSelector)
        }

        // target(selectorで指定されている要素)が存在している場合
        if (target) {
          // targetのBoundingClientRectを取得
          const targetBCR = target.getBoundingClientRect()
          // target要素自体のwidthまたはheightが0じゃなかったら（つまりブラウザ的に表示されてたら）
          if (targetBCR.width || targetBCR.height) {
            // TODO (fat): remove sketch reliance on jQuery position/offset
            return [
              // targetのoffset.top
              // targetのoffset.top(ブラウザの上の位置)とoffsetBase(windowの場合は0)を足してmapのキーにする
              $(target)[offsetMethod]().top + offsetBase,
              targetSelector // selector要素で指定されているhrefの値
            ]
          }
        }
        return null // ターゲットが存在していない場合は、nullを返す
      })
      .filter((item) => item) // mapのnullを削除
      .sort((a, b) => a[0] - b[0]) // キーの降順にする(ブラウザで一番下のtargetから)
      .forEach((item) => {
        this._offsets.push(item[0]) // _offsetsにtargetのoffsetを追加
        this._targets.push(item[1]) // _targetsにselectorで指定されているtargetを追加
      })
  }

  dispose() {
    //  data-spy="scroll"からScrollspayを削除する
    $.removeData(this._element, DATA_KEY)
    // イベントを削除
    $(this._scrollElement).off(EVENT_KEY)

    // 全部null
    this._element = null
    this._scrollElement = null
    this._config = null
    this._selector = null
    this._offsets = null
    this._targets = null
    this._activeTarget = null
    this._scrollHeight = null
  }

  // Private

  _getConfig(config) {
    config = {
      ...Default, // Defaultを格納
      ...typeof config === 'object' && config ? config : {} // configがobjectならDefaultを上書きして格納
    }

    // targetがstringじゃない場合
    if (typeof config.target !== 'string') {
      // targetのidを取得
      let id = $(config.target).attr('id')
      // idが存在していない場合
      if (!id) {
        // scrollspy+ランダムな値のIDを作成
        id = Util.getUID(NAME)
        // targetにid属性を付与して、idを設定
        $(config.target).attr('id', id)
      }
      // idが存在している場合は、config.targetに#idを設定
      config.target = `#${id}`
    }

    // configの型がDefaultTypeに一致するか判定
    Util.typeCheckConfig(NAME, config, DefaultType)

    // configを返す
    return config
  }

  _getScrollTop() {
    // scrollElementがwindowだった場合、そのページのスクロール量を取得
    // windowじゃない場合はその要素内のスクロール量を取得
    return this._scrollElement === window
      ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop
  }

  _getScrollHeight() {
    // scrollHeight(要素全体の高さ)が存在する場合は返す(scrollElementがwindowの場合は存在しない)
    // windowの場合も、表示されていない部分を含む全体の高さを取得
    return this._scrollElement.scrollHeight || Math.max(
      document.body.scrollHeight, // 各ブラウザでX軸のスクロールバーを含む高さの取得方法が違うから
      document.documentElement.scrollHeight // こんな感じで書いてる
    )
  }

  _getOffsetHeight() {
    // スクロール要素がwindowの場合は、windowで表示されている高さを返す
    // そうじゃない場合は、スクロール要素の高さを取得する
    return this._scrollElement === window
      ? window.innerHeight : this._scrollElement.getBoundingClientRect().height
  }

  _process() {
    // 要素のスクロール量を取得(windowならbodyの高さ)してconfig.offsetを足す
    // 現在のスクロール位置
    const scrollTop = this._getScrollTop() + this._config.offset
    // スクロール要素の高さの最大値を取得
    const scrollHeight = this._getScrollHeight()

    // 要素のスクロール出来る高さを取得する
    // スクロールしないと見えないところも含めて(window.inner)
    const maxScroll = this._config.offset + // 70
      scrollHeight - // 5863-1024
      this._getOffsetHeight() // スクロール要素の高さを取得する

      // scrollHeightが一致していない場合(両方とも_getScrollHeightで取得した値)
    if (this._scrollHeight !== scrollHeight) {
      // target要素(切り替わる要素のhrefで指定されている要素)の位置を取得
      this.refresh()
    }

    // scrollTopが、maxScroll以上の場合
    // つまり、スクロールが一番最後までスクロールされている状態
    if (scrollTop >= maxScroll) {
      // targets配列から一番最後の値を取得
      const target = this._targets[this._targets.length - 1]


      // (this._activeTargetがtargetと一致しない場合
      // スクロールが一番下まで行ってる場合、基本は一番最後のselectorがactiveになっているので、activeを付与
      if (this._activeTarget !== target) {
        // target要素に.activeを付与する
        // あと、this._activeTargetにtargetに格納
        this._activate(target)
      }
      // 処理終了
      return
    }

    // activeTargetがnullじゃなく、要素の現座のスクロール位置がthis._offset[0]未満の場合かつ、this._offset[0]が0より大きい場合
    // this.offsetsは、target要素のoffset
    if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
      // this._activeTargetをnullにする
      this._activeTarget = null
      // .activeを削除する
      this._clear()
      // 処理終了
      return
    }

    // offsetsの長さを取得
    const offsetLength = this._offsets.length
    // offsetsの長さの分だけループ
    for (let i = offsetLength; i--;) {
      // this._activeTarget(activeになってる要素)と、target要素が一致していないかつ、
      // scrollTop(スクロール量)が、target要素のoffset以上かつ、
      // this._offsets[i + 1]がundefined(最後のtarget要素)または、scrollTop(スクロール量)が、targetより少ない場合
      const isActiveTarget = this._activeTarget !== this._targets[i] &&
          scrollTop >= this._offsets[i] &&
          (typeof this._offsets[i + 1] === 'undefined' ||
              scrollTop < this._offsets[i + 1])

      // targetがactive判定の場合
      if (isActiveTarget) {
        // .activeを付与
        this._activate(this._targets[i])
      }
    }
  }

  _activate(target) {
    // target要素を代入
    this._activeTarget = target

    // selector要素から、.activeを削除する
    this._clear()

    const queries = this._selector
      .split(',') // selectorをカンマで区切る
      .map((selector) => `${selector}[data-target="${target}"],${selector}[href="${target}"]`) // 区切ったselectorに、data-targetまたはhrefにtargetを指定する

    // queries要素を取得する。queriesのイメージは以下
    // queries定義した時にmapで、targetを元に、selectorを取得しようとしてる
    // ".navbar .nav-link[data-target="#fat"],.navbar .nav-link[href="#fat"]"
    const $link = $([].slice.call(document.querySelectorAll(queries.join(','))))

    // $link要素が.dropdown-itemを持ってるか判定
    if ($link.hasClass(CLASS_NAME_DROPDOWN_ITEM)) {
      // $link付近の.dropdownを取得して、.dropdown-toggleに.activeを追加する
      $link.closest(SELECTOR_DROPDOWN).find(SELECTOR_DROPDOWN_TOGGLE).addClass(CLASS_NAME_ACTIVE)
      // $linkにも、.activeを追加する
      $link.addClass(CLASS_NAME_ACTIVE)
    } else {
      // .dropdown-itemを持っていない場合
      // $linkに.activeを追加
      $link.addClass(CLASS_NAME_ACTIVE)
      // トリガーされたリンクの親をアクティブに設定する
      // <ul>と<nav>の両方のマークアップでは、親はnavの祖先の前の兄弟要素
      // .navと.list-groupの親要素を取得して、.nav-linkと.list-group-itemの前の兄弟要素に、.activeを追加する
      $link.parents(SELECTOR_NAV_LIST_GROUP).prev(`${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`).addClass(CLASS_NAME_ACTIVE)
      // .nav-linkが.nav-item内にある場合の処理
      // .navと.list-groupの親要素を取得して、.nav-itemの子要素の.nav-linkに、.activeを追加すうｒ
      $link.parents(SELECTOR_NAV_LIST_GROUP).prev(SELECTOR_NAV_ITEMS).children(SELECTOR_NAV_LINKS).addClass(CLASS_NAME_ACTIVE)
    }

    // スクロール要素に対して、activeteイベントを発動する
    $(this._scrollElement).trigger(EVENT_ACTIVATE, {
      relatedTarget: target
    })
  }

  _clear() {
    // セレクター要素を取得して、.activeを持つ要素から.activeを削除する
    [].slice.call(document.querySelectorAll(this._selector))
      .filter((node) => node.classList.contains(CLASS_NAME_ACTIVE))
      .forEach((node) => node.classList.remove(CLASS_NAME_ACTIVE))
  }

  // Static

  static _jQueryInterface(config) {
    return this.each(function () {
      // spy要素のDATA_KEYを取得
      let data = $(this).data(DATA_KEY)
      // configがobjectの場合は、_configに格納
      // そうじゃない場合は、falseを格納
      const _config = typeof config === 'object' && config

      // dataが存在しない場合
      if (!data) {
        // インスタンス化。引数はspy要素とconfig
        data = new ScrollSpy(this, _config)
        // spy要素にdataを設定
        $(this).data(DATA_KEY, data)
      }

      // configがstringの場合
      if (typeof config === 'string') {
        // ScrollSpyに同じ名前のメソッドがあるか確認
        if (typeof data[config] === 'undefined') {
          // 存在しない場合はエラー
          throw new TypeError(`No method named "${config}"`)
        }
        // 存在する場合はメソッドを実行
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

$(window).on(EVENT_LOAD_DATA_API, () => { // 読み込み完了時
  // data-spy='scroll'要素を取得
  const scrollSpys = [].slice.call(document.querySelectorAll(SELECTOR_DATA_SPY))
  //  data-spy='scroll'の要素数を取得
  const scrollSpysLength = scrollSpys.length

  // data-spy='scroll'の要素数だけループ
  for (let i = scrollSpysLength; i--;) {
    // data-spy='scroll'の要素を取得
    const $spy = $(scrollSpys[i])
    // jQueryInterfaceを実行
    // $spy.data()は引数(spy要素についてるdata-属性を取得してconfigにしてる)
    ScrollSpy._jQueryInterface.call($spy, $spy.data())
  }
})

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = ScrollSpy._jQueryInterface
$.fn[NAME].Constructor = ScrollSpy
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return ScrollSpy._jQueryInterface
}

export default ScrollSpy
