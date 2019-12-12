/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): dropdown.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Popper from 'popper.js'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'dropdown'
const VERSION = '0.5.2'
const DATA_KEY = 'sc.dropdown'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]
const ESCAPE_KEYCODE = 27 // Escキー
const SPACE_KEYCODE = 32 // スペースキー
const TAB_KEYCODE = 9 // タブキー
const ARROW_UP_KEYCODE = 38 // ↑キー
const ARROW_DOWN_KEYCODE = 40 // ↓キー
const RIGHT_MOUSE_BUTTON_WHICH = 3 // マウスの右クリック
// 正規表現オブジェクト作成
const REGEXP_KEYDOWN = new RegExp(`${ARROW_UP_KEYCODE}|${ARROW_DOWN_KEYCODE}|${ESCAPE_KEYCODE}`)

const Event = {
  HIDE : `hide${EVENT_KEY}`,
  HIDDEN : `hidden${EVENT_KEY}`,
  SHOW : `show${EVENT_KEY}`,
  SHOWN: `shown${EVENT_KEY}`,
  CLICK : `click${EVENT_KEY}`,
  CLICK_DATA_API : `click${EVENT_KEY}${DATA_API_KEY}`,
  KEYDOWN_DATA_API : `keydown${EVENT_KEY}${DATA_API_KEY}`,
  KEYUP_DATA_API : `keyup${EVENT_KEY}${DATA_API_KEY}`
}

const ClassName = {
  DISABLED : 'disabled',
  SHOW : 'show',
  DROPUP : 'dropup',
  DROPRIGHT : 'dropright',
  DROPLEFT : 'dropleft',
  MENURIGHT : 'dropdown-menu-right',
  MENULEFT : 'dropdown-menu-left',
  POSITION_STATIC : 'position-static'
}

const Selector = {
  DATA_TOGGLE : '[data-toggle="dropdown"]',
  FORM_CHILD : '.dropdown form',
  MENU : '.dropdown-menu',
  NAVBAR_NAV : '.navbar-nav',
  VISIBLE_ITEMS : '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)'
}

const AttachmentMap = {
  TOP : 'top-start',
  TOPEND : 'top-end',
  BOTTOM : 'bottom-start',
  BOTTOMEND : 'bottom-end',
  RIGHT : 'right-start',
  RIGHTEND : 'right-end',
  LEFT : 'left-start',
  LEFTEND : 'left-end'
}

const Default = {
  offset : 0,
  flip : true,
  boundary : 'scrollParent',
  reference : 'toggle',
  display : 'dynamic',
  popperConfig : null
}

const DefaultType = {
  offset : '(number|string|function)',
  flip : 'boolean',
  boundary : '(string|element)',
  reference : '(string|element)',
  display : 'string',
  popperConfig : '(null|object)'
}

/**
 * ------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------
 */

class Dropdown {
  // エレメントとtoggle
  constructor(element, config) {
    this._element = element
    this._popper = null
    // configを取得
    this._config = this._getConfig(config)
    // .dropdown-menuを取得
    this._menu = this._getMenuElement()
    // dropdownがnavbarに存在しているか確認
    this._inNavbar = this._detectNavbar()
    // クリックイベントの設定
    this._addEventListeners()
  }

    // Getters

    static get VERSION() {
      return VERSION
    }
  
    static get Default() {
      return Default
    }
  
    static get DefaultType() {
      return DefaultType
    }

    toggle() {
      // エレメントがdisable属性もしくはclassを持ってたら処理終了
      if (this._element.disabled || $(this._element).hasClass(ClassName.DISABLED)) {
        return
      }
  
      // メニューが.showを持ってるか判定
      const isActive = $(this._menu).hasClass(ClassName.SHOW)
  
      // メニューを閉じる
      Dropdown._clearMenus()
  
      // .showを持ってたら処理終了
      if (isActive) {
        return
      }
  
      // 下のshowを発動
      this.show(true)
    }

    show(usePopper = false) {
      // dropdownもしくはメニューがdisableになってたら処理終了
      if (this._element.disabled || $(this._element).hasClass(ClassName.DISABLED) || $(this._menu).hasClass(ClassName.SHOW)) {
        return
      }

      // showを指定するターゲットを指定
      const relatedTarget = {
        relatedTarget: this._element
      }

      // show.sc.dropdownイベントを定義して、ターゲットを渡す
      const showEvent = $.Event(Event.SHOW, relatedTarget)

      // エレメントの親要素を取得
      const parent = Dropdown._getParentFromElement(this._element)

      // parentに対してshoweventを発動する
      $(parent).trigger(showEvent)

      // ブラウザの処理を禁止してたら処理終了
      if (showEvent.isDefaultPrevented()) {
        return
      }

    // NavbarでドロップダウンのPopper.jsを完全に無効にする
    if (!this._inNavbar && usePopper) {
      /**
       * Check for Popper dependency
       * Popper - https://popper.js.org
       */
      // popperが読み込まれているか確認
      if (typeof Popper === 'undefined') {
        throw new TypeError('Simplicss\'s dropdowns require Popper.js (https://popper.js.org/)')
      }

      // エレメントを格納
      let referenceElement = this._element

      // parentaだったら
      if (this._config.reference === 'parent') {
        // this._elementの親要素を格納する
        referenceElement = parent
        // this._config.referenceがdom要素だったら
      } else if (Util.isElement(this._config.reference)) {
        // this._config.referenceを突っ込む
        referenceElement = this._config.reference

        // jquery要素か確認する
        if (typeof this._config.reference.jquery !== 'undefined') {
          referenceElement = this._config.reference[0]
        }
      }

      // boundaryがscrollParentじゃない場合は、位置をstaticに設定してメニューが親をエスケープ出来るようにする
      if (this._config.boundary !== 'scrollParent') {
        // parentに.position-staticを追加
        $(parent).addClass(ClassName.POSITION_STATIC)
      }
      // popperをインスタンス化
      this._popper = new Popper(referenceElement, this._menu, this._getPopperConfig())
    }

        // タッチデバイスの場合、空のマウスオーバリスナーを追加
    if ('ontouchstart' in document.documentElement &&
        $(parent).closest(Selector.NAVBAR_NAV).length === 0) {
      $(document.body).children().on('mouseover', null, $.noop)
    }

    // フォーカスさせる。キーイベントのため？
    this._element.focus()
    // aria-expanded属性を付与してtrueを設定する
    this._element.setAttribute('aria-expanded', true)

    // menueの.showを切り替える
    $(this._menu).toggleClass(ClassName.SHOW)
    // parentの.showを切り替えて、表示後のイベントをrelatedTargerに対して発動する
    $(parent)
      .toggleClass(ClassName.SHOW)
      .trigger($.Event(Event.SHOWN, relatedTarget))
  }

   // Private

   _addEventListeners() {
     // this_elementをクリックした時のイベントを定義する
    $(this._element).on(Event.CLICK, (event) => {
      // this._elementイベント禁止
      event.preventDefault()
      // 親要素のイベントが実行されないようにeventの伝播を禁止する
      event.stopPropagation()
      // 要素の表示を切り替える
      this.toggle()
    })
  }

  // configを取得
  _getConfig(config) {
    config = {
      // default
      ...this.constructor.Default,
      // 要素に格納してあるデータとキーを取得する
      ...$(this._element).data(),
      // toggle
      ...config
    }

    Util.typeCheckConfig(
      // dropdown
      NAME,
      // toggle
      config,
      // default type
      this.constructor.DefaultType
    )

    return config
  }

  _getMenuElement() {
    // this._menuが存在しなかった場合
    if (!this._menu) {
      // this._elementの親要素を返す
      const parent = Dropdown._getParentFromElement(this._element)

      // parentが存在していた場合
      if (parent) {
        // .dropdown-menuをthis._menuに格納する
        this._menu = parent.querySelector(Selector.MENU)
      }
    }
    // this._menuが存在してたらそのまま返す。
    // 存在してなかったら、取得して返す
    return this._menu
  }

  _getPlacement() {
    // this.elementの親要素を取得
    const $parentDropdown = $(this._element.parentNode)
    // bottom-startを格納。初期値
    let placement = AttachmentMap.BOTTOM

    // dropupを持ってたら
    if ($parentDropdown.hasClass(ClassName.DROPUP)) {
      // top-startを格納
      placement = AttachmentMap.TOP
      // メニューがdropdown-menu-rightを持っていた場合
      if ($(this._menu).hasClass(ClassName.MENURIGHT)) {
        // top-endを格納
        placement = AttachmentMap.TOPEND
      }
    // droprightを持っていた場合
    } else if ($parentDropdown.hasClass(ClassName.DROPRIGHT)) {
      // right-startを格納
      placement = AttachmentMap.RIGHT
    // dropleftを持っていた場合
    } else if ($parentDropdown.hasClass(ClassName.DROPLEFT)) {
      // left-startを格納
      placement = AttachmentMap.LEFT
    // dropdown-menu-rightを持っていた場合
    } else if ($(this._menu).hasClass(ClassName.MENURIGHT)) {
      // bottom-endを格納
      placement = AttachmentMap.BOTTOMEND
    }
    return placement
  }

  _detectNavbar() {
    // .navbar要素にdropdownが存在していないか確認
    return $(this._element).closest('.navbar').length > 0
  }

  _getOffset() {
    const offset = {}
    // this._config.offsetが関数だったら
    if (typeof this._config.offset === 'function') {
      // dataはpopperみたい
      offset.fn = (data) => {
        //data.offsetに展開して格納
        data.offsets = {
          ...data.offsets,
          ...this._config.offset(data.offsets, this._element) || {}
        }

        return data
      }
    } else {
      // offsetにthis._config.offsetを入れる
      offset.offset = this._config.offset
    }

    return offset
  }

  _getPopperConfig() {
    // popperの設定を定義
    const popperConfig = {
      // 表示位置
      placement: this._getPlacement(),
      // offsetを更新するためのリスト
      modifiers: {
        // offset
        offset: this._getOffset(),
        // popperの表示を反転する
        flip: {
          enabled: this._config.flip
        },
        // flipを動作させるためにpreventOverflowが必要
        preventOverflow: {
          boundariesElement: this._config.boundary
        }
      }
    }

    // this._config.displayがstaticの場合は、popperを無効化する
    if (this._config.display === 'static') {
      popperConfig.modifiers.applyStyle = {
        enabled: false
      }
    }

    return {
      // popperの設定を展開して返す
      ...popperConfig,
      ...this._config.popperConfig
    }
  }

  // Static

  static _jQueryInterface(config) {
    return this.each(function () {
      let data = $(this).data(DATA_KEY)
      const _config = typeof config === 'object' ? config : null

      if (!data) {
        data = new Dropdown(this, _config)
        $(this).data(DATA_KEY, data)
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        data[config]()
      }
    })
  }

  static _clearMenus(event) {
    // イベントが存在していてかつ、イベントがマウスの右クリックまたはキーを離した、またはタブキーじゃないものを押下した場合
    if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH ||
      event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
      // 処理を終了する
      return
    }

    //  '[data-toggle="dropdown"]'をもつ .要素を全て取得する
    const toggles = [].slice.call(document.querySelectorAll(Selector.DATA_TOGGLE))

    // 取得したtogglesの数だけループ回す
    for (let i = 0, len = toggles.length; i < len; i++) {
      // togglesの親ノードを取得する
      const parent = Dropdown._getParentFromElement(toggles[i])
      // toggle要素のsc.dropdownを取得する
      const context = $(toggles[i]).data(DATA_KEY)
      // 連想配列にtoggleを追加
      const relatedTarget = {
        relatedTarget: toggles[i]
      }

      // イベントが存在してイベントがclickだったら
      if (event && event.type === 'click') {
        // relatedTargetのclickイベントにイベントを追加
        relatedTarget.clickEvent = event
      }

      // sc.dropdownが存在していたら
      if (!context) {
        // 処理を継続する
        continue
      }

      // contextのmenuをdropdownmenuに代入
      const dropdownMenu = context._menu
      // parentがshowクラスを持ってたら
      if (!$(parent).hasClass(ClassName.SHOW)) {
        // 処理を継続
        continue
      }

      // イベントが存在してるのが前提
      // イベントがclickで、イベントのターゲットタグがinputもしくはtextareaまたは、イベントがキーを離してイベントキーがタブ以外でparentの中にイベントのターゲット要素が含まれている場合
      if (event && (event.type === 'click' &&
          /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) &&
          $.contains(parent, event.target)) {
        // 処理を継続
        continue
      }

      // hideイベントオブジェクトを定義する。
      // relatedTargetはイベント発生時に実行する関数に渡す値
      // http://www.jquerystudy.info/reference/events/event.html
      const hideEvent = $.Event(Event.HIDE, relatedTarget)
      // parent要素に対して、hideEventを発生去せる
      $(parent).trigger(hideEvent)
      // hideがブラウザの動作を停止していたら
      if (hideEvent.isDefaultPrevented()) {
        // 処理を継続する
        continue
      }

      // タッチデバイスだった場合、iOS用のマウスオーバリスナーを削除
      if ('ontouchstart' in document.documentElement) {
        $(document.body).children().off('mouseover', null, $.noop)
      }

      // toggleに'aria-expanded=falseを設定
      toggles[i].setAttribute('aria-expanded', 'false')

      // contextにpopperがあったら
      if (context._popper) {
        // 削除する
        context._popper.destroy()
      }

      // .dropdown-menuの.showを削除
      $(dropdownMenu).removeClass(ClassName.SHOW)
      // parentの.showを削除してhiddenイベントを定義しつつ発動
      $(parent)
        .removeClass(ClassName.SHOW)
        .trigger($.Event(Event.HIDDEN, relatedTarget))
    }
  }

  static _getParentFromElement(element) {
    let parent
    // data-targetかtrimされたhrefのどっちかを返す
    const selector = Util.getSelectorFromElement(element)

    // selectorが存在した場合
    if (selector) {
      // documentからselectorの要素を取得する
      parent = document.querySelector(selector)
    }
    
    // parentが存在していたらparentを返す
    // そうでなければ、elementのparentNodeで返す
    // parentNodeは親ノード
    return parent || element.parentNode
  }

  // eslint-disable-next-line complexity
  static _dataApiKeydownHandler(event) {
    // If not input/textarea:
    //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
    // If input/textarea:
    //  - If space key => not a dropdown command
    //  - If key is other than escape
    //    - If key is not up or down => not a dropdown command
    //    - If trigger inside the menu => not a dropdown command
    if (/input|textarea/i.test(event.target.tagName)
      ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE &&
      (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE ||
        $(event.target).closest(Selector.MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    if (this.disabled || $(this).hasClass(ClassName.DISABLED)) {
      return
    }

    const parent   = Dropdown._getParentFromElement(this)
    const isActive = $(parent).hasClass(ClassName.SHOW)

    if (!isActive && event.which === ESCAPE_KEYCODE) {
      return
    }

    if (!isActive || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {
      if (event.which === ESCAPE_KEYCODE) {
        const toggle = parent.querySelector(Selector.DATA_TOGGLE)
        $(toggle).trigger('focus')
      }

      $(this).trigger('click')
      return
    }

    const items = [].slice.call(parent.querySelectorAll(Selector.VISIBLE_ITEMS))
      .filter((item) => $(item).is(':visible'))

    if (items.length === 0) {
      return
    }

    let index = items.indexOf(event.target)

    if (event.which === ARROW_UP_KEYCODE && index > 0) { // Up
      index--
    }

    if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) { // Down
      index++
    }

    if (index < 0) {
      index = 0
    }

    items[index].focus()
  }
}
