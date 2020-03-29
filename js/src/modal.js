/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): modal.js
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

const NAME = 'modal'
const VERSION = '4.4.1'
const DATA_KEY = 'sc.modal'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]
const ESCAPE_KEYCODE = 27 // KeyboardEvent.which value for Escape (Esc) key

const Default = {
  backdrop : true,
  keyboard : true,
  focus : true,
  show : true
}

const DefaultType = {
  backdrop : '(boolean|string)',
  keyboard : 'boolean',
  focus : 'boolean',
  show : 'boolean'
}

const Event = {
  HIDE : `hide${EVENT_KEY}`,
  HIDE_PREVENTED : `hidePrevented${EVENT_KEY}`,
  HIDDEN : `hidden${EVENT_KEY}`,
  SHOW : `show${EVENT_KEY}`,
  SHOWN : `shown${EVENT_KEY}`,
  FOCUSIN : `focusin${EVENT_KEY}`,
  RESIZE : `resize${EVENT_KEY}`,
  CLICK_DISMISS : `click.dismiss${EVENT_KEY}`,
  KEYDOWN_DISMISS : `keydown.dismiss${EVENT_KEY}`,
  MOUSEUP_DISMISS : `mouseup.dismiss${EVENT_KEY}`,
  MOUSEDOWN_DISMISS : `mousedown.dismiss${EVENT_KEY}`,
  CLICK_DATA_API : `click${EVENT_KEY}${DATA_API_KEY}`
}

const ClassName = {
  SCROLLABLE : 'modal-dialog-scrollable',
  SCROLLBAR_MEASURER : 'modal-scrollbar-measure',
  BACKDROP : 'modal-backdrop',
  OPEN : 'modal-open',
  FADE : 'fade',
  SHOW : 'show',
  STATIC : 'modal-static'
}

const Selector = {
  DIALOG : '.modal-dialog',
  MODAL_BODY : '.modal-body',
  DATA_TOGGLE : '[data-toggle="modal"]',
  DATA_DISMISS : '[data-dismiss="modal"]',
  FIXED_CONTENT : '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
  STICKY_CONTENT : '.sticky-top'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Modal {
  constructor(element, config) {
    // configを取得
    this._config = this._getConfig(config)
    // modal要素
    this._element = element
    // .modal-dialog要素を取得する
    this._dialog = element.querySelector(Selector.DIALOG)
    this._backdrop = null
    this._isShown = false
    this._isBodyOverflowing = false
    this._ignoreBackdropClick = false
    this._isTransitioning = false
    this._scrollbarWidth = 0
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  static get Default() {
    return Default
  }

  // Public

  toggle(relatedTarget) {
    // isShownがtrueだった場合は、hideを実行
    // falseの場合は、クリックされるbtn要素を引数に、showを実行
    return this._isShown ? this.hide() : this.show(relatedTarget)
  }

  show(relatedTarget) {
    // isShownか_isTransitioningがtrueの場合は処理終了
    if (this._isShown || this._isTransitioning) {
      return
    }

    // modal要素が、fadeクラスを持っていたら
    if ($(this._element).hasClass(ClassName.FADE)) {
      // _isTransitioningにtrueを代入
      this._isTransitioning = true
    }

    // showイベントをrelatedTargetに対して、定義する。
    const showEvent = $.Event(Event.SHOW, {
      relatedTarget
    })

    // modalイベントに対してshowイベントを発動する
    $(this._element).trigger(showEvent)

    // isShownがtrueもしくは、showEvenetがブラウザの動作を停止していた場合
    // 処理終了
    if (this._isShown || showEvent.isDefaultPrevented()) {
      return
    }

    // isShownをtrueにする
    this._isShown = true

    // スクロールバーが存在するか確認し
    // スクロールバーの横幅を取得
    this._checkScrollbar()
    // .modal-openでoverflow: hiddenにしたとき、
    // 表示がくずれない用に、paddingかmarginを調整する
    this._setScrollbar()

    // modal要素の幅をスクロールバーに合わせて調整
    this._adjustDialog()

    // ESCキー押下時のイベントをmodal要素に対して設定
    // .modal-staticが付与されていたらアニメーションしながらフォーカスする。付与されていなかったらhide
    this._setEscapeEvent()
    // windowリサイズ時に、modal要素の横幅を調整する
    // イベントを定義
    this._setResizeEvent()

    // modal要素に、click-dismissイベントを設定
    // 対象セクレタのdata-dismiss='modal'クリック時に
    // modalをhideする
    $(this._element).on(
      Event.CLICK_DISMISS,
      Selector.DATA_DISMISS,
      (event) => this.hide(event)
    )

    // .modal-dialog要素に、マウスボタン押下時のイベントを定義する
    $(this._dialog).on(Event.MOUSEDOWN_DISMISS, () => {
      // modal要素に対して、マウスボタンが離れた時のイベントをバインドする
      $(this._element).one(Event.MOUSEUP_DISMISS, (event) => {
        // event.target(マウスが離れた場所)とmodal要素が一致していた場合
        if ($(event.target).is(this._element)) {
          this._ignoreBackdropClick = true
        }
      })
    })

    // _showBackdropはmodalが表示されていたらbackdropを表示して_showElementを実行
    // modalが非表示ならbackdropを削除して_showElementを実行
    // _config.backdropがfalseならcallbackを実行するだけ
    // showElementはmodalを表示する
    this._showBackdrop(() => this._showElement(relatedTarget))
  }

  hide(event) {
    // イベントがあったら停止
    if (event) {
      event.preventDefault()
    }

    // modalが表示されているか、遷移中なら処理終了
    if (!this._isShown || this._isTransitioning) {
      return
    }

    // hideイベントを定義する
    const hideEvent = $.Event(Event.HIDE)

    // modal要素に対して、hideイベントを実行する
    $(this._element).trigger(hideEvent)
    // modalが表示いないまたは、hideEventがブラウザの動作を停止させている場合は処理終了
    if (!this._isShown || hideEvent.isDefaultPrevented()) {
      return
    }

    // isShownをfalseにする
    this._isShown = false
    // modal要素が.fadeを持っているか判定
    const transition = $(this._element).hasClass(ClassName.FADE)

    // modal要素が.fadeを持っている場合
    if (transition) {
      // _isTransitioningをtrueにする
      this._isTransitioning = true
    }

    // modal要素からエスケープキーでmodalをhideするイベントを削除する
    this._setEscapeEvent()
    // modal要素からブラウザのリサイズイベントを削除する
    this._setResizeEvent()

    // focusinイベントを削除
    $(document).off(Event.FOCUSIN)

    // modal要素から.showを削除する
    $(this._element).removeClass(ClassName.SHOW)

    // modal要素からクリックを離した時のイベントを削除する
    $(this._element).off(Event.CLICK_DISMISS)
    // dialogからマウスダウンを離したときのイベントを削除する
    $(this._dialog).off(Event.MOUSEDOWN_DISMISS)


    // modal要素が.fadeを持っていたら
    if (transition) {
      // modal要素の遷移時間を取得する
      const transitionDuration  = Util.getTransitionDurationFromElement(this._element)

      // 遷移終了時にmodalを非表示にする
      $(this._element)
        .one(Util.TRANSITION_END, (event) => this._hideModal(event))
        .emulateTransitionEnd(transitionDuration)
    } else {
      // modalを非表示にする
      this._hideModal()
    }
  }

  dispose() {
    // window、this_element、this._dialogのイベントを削除する
   [window, this._element, this._dialog]
      .forEach((htmlElement) => $(htmlElement).off(EVENT_KEY))

    // documentには、Event.FOCUSIN`と `Event.CLICK_DATA_APIの2つのイベントがある
    // documentのfocusinイベントを削除
    $(document).off(Event.FOCUSIN)

    // modal要素からdata_keyを削除する
    $.removeData(this._element, DATA_KEY)

    // 各種設定初期化
    this._config = null
    this._element = null
    this._dialog = null
    this._backdrop = null
    this._isShown = null
    this._isBodyOverflowing = null
    this._ignoreBackdropClick = null
    this._isTransitioning = null
    this._scrollbarWidth = null
  }

  handleUpdate() {
    // modal要素の幅をスクロールバーに合わせて調整
    this._adjustDialog()
  }

  // Private

  _getConfig(config) {
    // configにDefaultとconfigを格納する
    config = {
      ...Default,
      ...config
    }
    // configの型がDefaultTypeと一致しているか確認
    // 一致していなかった場合は、エラー
    Util.typeCheckConfig(NAME, config, DefaultType)
    // configを返す
    return config
  }

  _triggerBackdropTransition() {
    // .modal-staticはアニメーションで要素をフォーカスする
    // _config.backdropがstaticの場合（Defaultではstatic）
    if (this._config.backdrop === 'static') {
      // hidePreventedイベントを定義する
      const hideEventPrevented = $.Event(Event.HIDE_PREVENTED)

      // modal要素に対してhideEventPreventedを実行する
      $(this._element).trigger(hideEventPrevented)
      // イベントでブラウザのデフォルトの動作が停止されていた場合は処理終了
      if (hideEventPrevented.defaultPrevented) {
        return
      }

      // modal要素に.staticを追加
      this._element.classList.add(ClassName.STATIC)

      // modal要素の遷移時間を取得
      const modalTransitionDuration = Util.getTransitionDurationFromElement(this._element)

      // 遷移終了時のイベントをバインド
      $(this._element).one(Util.TRANSITION_END, () => {
        // modal要素から.staticを削除
        this._element.classList.remove(ClassName.STATIC)
      })
      .emulateTransitionEnd(modalTransitionDuration) // 遷移終了時のイベントを実行
      this._element.focus() // modal要素にフォーカスする
    } else {
      // this._config.backdropがstaticじゃない場合は
      // hideを実行
      this.hide()
    }
  }

  _showElement(relatedTarget) {
    // relatedTargetはbtnとかのトリガー要素
    // this._elementはmodal要素

    // modal要素が.fadeを持っているか判定
    const transition = $(this._element).hasClass(ClassName.FADE)
    // this._dialogが存在する場合は、modal-body要素を取得する。
    // 存在しない場合は、null
    const modalBody = this._dialog ? this._dialog.querySelector(Selector.MODAL_BODY) : null

    // modal要素の親要素が存在していないまたは、
    // parentNodeのがエレメントじゃない場合
    if (!this._element.parentNode ||
        this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
      // bodyにmodal要素を追加する
      document.body.appendChild(this._element)
    }

    // modal要素にdisplay:block;を設定する
    this._element.style.display = 'block'
    // modal要素のaria-hidden属性を削除する
    this._element.removeAttribute('aria-hidden')
    // modal要素に、aria-modal="true"を設定する
    this._element.setAttribute('aria-modal', true)

    // .modal-dialogが.modal-dialog-scrollableを持っているかつ、
    // .modal-body要素が存在する場合
    if ($(this._dialog).hasClass(ClassName.SCROLLABLE) && modalBody) {
      // .modal-bodyのスクロール位置を0にする
      modalBody.scrollTop = 0
    } else {
      // modal要素のスクロール位置を0にする
      this._element.scrollTop = 0
    }

    // modal要素が.fadeを持っている場合
    if (transition) {
      // modal要素のpaddingとborderを含む
      // 高さを取得する
      Util.reflow(this._element)
    }

    // modal要素に.showを追加する
    $(this._element).addClass(ClassName.SHOW)

    // _config.focusがtrueの場合
    if (this._config.focus) {
      // modal要素をフォーカスする
      this._enforceFocus()
    }

    // shownイベントを定義する
    const shownEvent = $.Event(Event.SHOWN, {
      relatedTarget
    })

    // 遷移完了後のイベントを定義
    const transitionComplete = () => {
      // _config.focusがtrueならフォーカスする
      if (this._config.focus) {
        this._element.focus()
      }
      // _isTransitioningをfalseにする
      this._isTransitioning = false
      // modal要素に対して、shownEventを発動する
      $(this._element).trigger(shownEvent)
    }

    // modal要素が.fadeを持っている場合
    if (transition) {
      // .modal-dialog要素から遷移時間を取得
      const transitionDuration  = Util.getTransitionDurationFromElement(this._dialog)

      // modal-dialogにtransisionendイベントをバインドして
      // 遷移時間分ずらして実行
      $(this._dialog)
        .one(Util.TRANSITION_END, transitionComplete)
        .emulateTransitionEnd(transitionDuration)
    } else {
      // modal要素が.fadeをもっていない場合は、
      // transitionCompleteを実行する
      transitionComplete()
    }
  }

  // modal要素をフォーカスする
  _enforceFocus() {
    $(document)
      .off(Event.FOCUSIN) // 無限フォーカスループにならないように、フォーカスイベントを削除する
      .on(Event.FOCUSIN, (event) => { // フォーカスイベントをバインドする
        if (document !== event.target && // event.targetとdocumentが一致しない
            this._element !== event.target && // event.targetとmodal要素が一致しない
            $(this._element).has(event.target).length === 0) { // modal要素にevent.targetが存在しない場合
              // modal要素をフォーカスする
              this._element.focus()
        }
      })
  }

  _setEscapeEvent() {
    if (this._isShown) { // isShownがtrueだった場合（show関数の冒頭でtrueにしてる）
      // modal要素に、keydown.dismissイベントをバインドする
      $(this._element).on(Event.KEYDOWN_DISMISS, (event) => {
        //  _config.keyboardがtrueで、エスケープキーを謳歌された場合
        if (this._config.keyboard && event.which === ESCAPE_KEYCODE) {
          // エスケープキーのデフォルト動作を停止する
          event.preventDefault()
          // hideを実行
          this.hide()
        } else if (!this._config.keyboard && event.which === ESCAPE_KEYCODE) {
          // _config.keyboardがfalseで、エスケープキーが押下されたとき
          // backdropが'static'の場合は、要素をアニメーションしながらフォーカスする
          // staticじゃない場合はhideする
          this._triggerBackdropTransition()
        }
      })
    } else if (!this._isShown) { // modalが表示されていないとき
      // modalから、キーイベントを削除する
      $(this._element).off(Event.KEYDOWN_DISMISS)
    }
  }

  _setResizeEvent() {
    // modalが表示されていたら
    if (this._isShown) {
      // windowのリサイズ時イベントを設定する
      // modal要素の幅をスクロールバーに合わせて調整
      $(window).on(Event.RESIZE, (event) => this.handleUpdate(event))
    } else {
      // modalが表示されていない場合は、リサイズイベント削除
      $(window).off(Event.RESIZE)
    }
  }

  _hideModal() {
    // modal要素にdisplay:none;を設定する
    this._element.style.display = 'none'
    // modal要素にaria-hidden='true'を付与する
    this._element.setAttribute('aria-hidden', true)
    // modal要素からaria-modal属性を削除する
    this._element.removeAttribute('aria-modal')
    // _isTransitioningをfasleにする
    this._isTransitioning = false
    // backdropを削除する
    this._showBackdrop(() => {
      $(document.body).removeClass(ClassName.OPEN) // modyの.modal-openを削除する
      this._resetAdjustments() // modal要素から左右のpaddingを削除する
      this._resetScrollbar() // setScrollbarで設定したpaddingとかを削除する
      // hiddenイベントを発動する
      $(this._element).trigger(Event.HIDDEN)
    })
  }

  _removeBackdrop() {
    if (this._backdrop) { // backdrop要素が存在していた場合
      $(this._backdrop).remove() // backdrop要素を削除
      this._backdrop = null // backdrop要素をnullにする
    }
  }

  // callbackは関数
  _showBackdrop(callback) {
    // backdropはmodal表示時の背景
    // http://bootstrap3.cyberlab.info/javascript/modals-options-backdrop.html#usage2

    // modal要素が.fadeを持っている場合はfadeを格納
    // 持っていない場合は空文字
    const animate = $(this._element).hasClass(ClassName.FADE)
      ? ClassName.FADE : ''

    // _isShownと_config.backdropがtrueの場合
    // modalをshowするとき
    if (this._isShown && this._config.backdrop) {
      // _backdropに<div>を作成する
      this._backdrop = document.createElement('div')
      // divに.modal-backdropを付与する
      this._backdrop.className = ClassName.BACKDROP

      // modal要素が.fadeを持っていた場合
      if (animate) {
        // backdropに.fadeを追加
        this._backdrop.classList.add(animate)
      }

      // body要素にdiv.modal-backdrop要素を追加
      $(this._backdrop).appendTo(document.body)

      // クリックを離したときにのイベントを定義
      $(this._element).on(Event.CLICK_DISMISS, (event) => {
        // this._ignoreBackdropClickがtrueの場合
        if (this._ignoreBackdropClick) {
          // falseにして、処理を終了する
          this._ignoreBackdropClick = false
          return
        }
        // クリックを離したところと、イベントハンドラがアタッチされた要素が一致しない場合
        if (event.target !== event.currentTarget) {
          // 処理を終了する
          return
        }

        // backdropが'static'の場合は、要素をアニメーションしながらフォーカスする
        // staticじゃない場合はhideする
        this._triggerBackdropTransition()
      })

      // modal要素が.fadeを持っていた場合
      if (animate) {
        // backdropの高さを取得する
        Util.reflow(this._backdrop)
      }

      // backdropに.showを追加する
      $(this._backdrop).addClass(ClassName.SHOW)

      // callbackが存在しない場合は処理終了
      if (!callback) {
        return
      }

      // .fadeが付与されていなかったらcallbackを実行して処理終了
      if (!animate) {
        callback()
        return
      }

      // 以下は、.fadeがmodal要素に付与されていて、callabckが存在する場合

      // backdropの遷移時間を取得する
      const backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop)

      // backdropの遷移終了時のイベントを定義し、
      // 遷移時間の分だけ送らせて実行
      $(this._backdrop)
        .one(Util.TRANSITION_END, callback)
        .emulateTransitionEnd(backdropTransitionDuration)
    } else if (!this._isShown && this._backdrop) {
      // isShownがfalseで、backdropがtrueの場合
      // modalをhideするとき

      // backdrop要素から.showを削除
      $(this._backdrop).removeClass(ClassName.SHOW)

      // backdropを削除する関数を定義
      const callbackRemove = () => {
        this._removeBackdrop() // backdropを削除
        if (callback) { // callback関数が存在していたら実行
          callback()
        }
      }

      // modal要素が.fadeを持っていたら
      if ($(this._element).hasClass(ClassName.FADE)) {
        // backdropの遷移時間を取得する
        const backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop)

        // backdropの遷移終了時にcallbackRemoveを実行
        $(this._backdrop)
          .one(Util.TRANSITION_END, callbackRemove)
          .emulateTransitionEnd(backdropTransitionDuration)
      } else {
        // .fadeがなかったらそのままbackdropを削除
        callbackRemove()
      }
    } else if (callback) {
      // _config.backdropがfalseの場合は、
      // callbackを実行
      callback()
    }
  }

  // ----------------------------------------------------------------------
  // the following methods are used to handle overflowing modals
  // todo (fat): these should probably be refactored out of modal.js
  // ----------------------------------------------------------------------

  _adjustDialog() {
    // this._elementはmodal要素

    // modal要素の高さが、ブラウザの表示高さを超えていた場合は、true
    // this.elementは表示されてないから、基本は0
    const isModalOverflowing =
      this._element.scrollHeight > document.documentElement.clientHeight

    // _isBodyOverflowingがfalseで、isModalOverflowingがtrueの場合
    if (!this._isBodyOverflowing && isModalOverflowing) {
      // modal要素の実際のpadding-leftをスクロールバーの幅にする
      this._element.style.paddingLeft = `${this._scrollbarWidth}px`
    }

    // _isBodyOverflowingがtrueで、isModalOverflowingがfalseの場合
    if (this._isBodyOverflowing && !isModalOverflowing) {
      // modal要素の実際のpadding-rightをスクロールバーの幅にする
      this._element.style.paddingRight = `${this._scrollbarWidth}px`
    }
  }

  _resetAdjustments() {
    // modal要素から左右のpaddingを削除する
    this._element.style.paddingLeft = ''
    this._element.style.paddingRight = ''
  }

  _checkScrollbar() {
    // body要素の幅を取得
    const rect = document.body.getBoundingClientRect()
    // body要素の幅(right+left)がwindowのコンテンツ幅より小さいか判定
    // つまりX方向にスクロールバーがあるか確認
    this._isBodyOverflowing = rect.left + rect.right < window.innerWidth
    // スクロールバーの横幅を取得
    this._scrollbarWidth = this._getScrollbarWidth()
  }

  _setScrollbar() {
    // body要素がはみ出ていた場合
    if (this._isBodyOverflowing) {
      // DOMNode.style.paddingRightは実際の値を返す。設定されていない場合は''を返す
      // $(DOMNode).css('padding-right')はcssの値を返す。設定されていない場合は''を返す

      // .fixed-top、.fixed-bottom、.is-fixed、.sticky-topを持つ要素を取得する
      const fixedContent = [].slice.call(document.querySelectorAll(Selector.FIXED_CONTENT))
      // .sticky-topを持つ要素を取得する
      const stickyContent = [].slice.call(document.querySelectorAll(Selector.STICKY_CONTENT))

      // 固定コンテンツのpaddingを調整する
      $(fixedContent).each((index, element) => {
        // fixedContentの実際のpadding-rightを取得する
        const actualPadding = element.style.paddingRight
        // fixedContentにcssで設定されているpadding-rightを取得
        const calculatedPadding = $(element).css('padding-right')
        $(element)
          .data('padding-right', actualPadding) // elementに実際のpadding-rightを設定する
          .css('padding-right', `${parseFloat(calculatedPadding) + this._scrollbarWidth}px`) // elementのpadding-rightにスクロールバーの横幅を足した値を設定する
      })

      // stickyコンテンツのmarginを調整する
      $(stickyContent).each((index, element) => {
        // stickyコンテンツの実際のmargin-rightを取得する
        const actualMargin = element.style.marginRight
        // stickyコンテンツにcssで指定されているmargin-rightを取得する
        const calculatedMargin = $(element).css('margin-right')
        $(element)
          .data('margin-right', actualMargin) // elementに実際のmargin-rightを設定する
          .css('margin-right', `${parseFloat(calculatedMargin) - this._scrollbarWidth}px`) // elementのmargin-rightにスクロールバーの横幅を足した値を設定する
      })

      // body要素のpaddingを調整する
      // body要素の実際のpadding-rightを取得する
      const actualPadding = document.body.style.paddingRight
      // body要素にcssで指定されているpadding-rightを取得する
      const calculatedPadding = $(document.body).css('padding-right')

      $(document.body)
        .data('padding-right', actualPadding) // body要素に実際のpadding-rightを設定する
        .css('padding-right', `${parseFloat(calculatedPadding) + this._scrollbarWidth}px`) // body要素のpadding-rightにスクロールバーの横幅を足した値を設定する
    }

    // body要素に.modal-openを追加する
    // overflow: hidden;でスクロールバーがなくなった時に、表示がずれないようにするため
    $(document.body).addClass(ClassName.OPEN)
  }

  _resetScrollbar() {
    // fixedコンテンツのpaddindを戻す
    // fixedクラスを持つ要素を取得
    const fixedContent = [].slice.call(document.querySelectorAll(Selector.FIXED_CONTENT))
    $(fixedContent).each((index, element) => {
      // _setScrollbarで設定したpadding-rightを取得する
      const padding = $(element).data('padding-right')
      // padding-right属性を削除
      $(element).removeData('padding-right')
      // paddingが存在したらそれを代入。なかったら空文字
      element.style.paddingRight = padding ? padding : ''
    })

    // stickyコンテンツのpaddingを戻す
    // .sticky-topが付与された要素を収録
    const elements = [].slice.call(document.querySelectorAll(`${Selector.STICKY_CONTENT}`))
    $(elements).each((index, element) => {
      // 要素からmargin-rightを取得
      const margin = $(element).data('margin-right')
      // marginがundefinedじゃなかったら
      if (typeof margin !== 'undefined') {
        // .sticky-topのmargin-rightを削除する
        $(element).css('margin-right', margin).removeData('margin-right')
      }
    })

    // bodyのpadding-rightを戻す
    const padding = $(document.body).data('padding-right')
    // modyのpadding-rightを咲くjおする
    $(document.body).removeData('padding-right')
    // paddingが存在したらその値、なかったら空文字
    document.body.style.paddingRight = padding ? padding : ''
  }

  _getScrollbarWidth() { // thx d.walsh
    // div要素を作成
    const scrollDiv = document.createElement('div')
    // divに.modal-scrollbar-measurerを付与
    scrollDiv.className = ClassName.SCROLLBAR_MEASURER
    // scrolldivをbody要素に追加
    document.body.appendChild(scrollDiv)
    // scrollDiv.getBoundingClientRectはscssで指定したwidthを取得(50px)
    // clientWidthはスクロールバーの横幅を含まないscrollDivの横幅を取得
    // これを引くと、スクロールバーの横幅になる
    const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth
    // scrollDivを削除
    document.body.removeChild(scrollDiv)
    // スクロールバーの横幅を返す
    return scrollbarWidth
  }

  // Static

  // relatedTargetはクリックされるbtn要素
  static _jQueryInterface(config, relatedTarget) {
    return this.each(function () {
      // thisはmodal要素
      // thisのDATA_KEYを取得
      let data = $(this).data(DATA_KEY)
      // _configに値を格納する
      const _config = {
        ...Default, // Defaultを格納
        ...$(this).data(), // modal要素からdataを取得し格納
        ...typeof config === 'object' && config ? config : {} // ongjectかつ存在してたら、configを格納。そうじゃないなら{}を格納
      }

      // dataが存在していなかったら
      if (!data) {
        // modalをインスタンス化してdataに格納する
        data = new Modal(this, _config)
        // dataをmodal要素に入れる
        $(this).data(DATA_KEY, data)
      }

      // configがStringの場合
      if (typeof config === 'string') {
        // modalクラスにメソッドが存在するか確認
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        // メソッドが存在した場合は、relatedTargetを引数に実行する
        data[config](relatedTarget)
      } else if (_config.show) { // _config.showがtrueの場合
        // relatedTargetを引数にshowを実行する
        data.show(relatedTarget)
      }
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

 // sc.modal.data-apiのイベントを定義する
 // 対象は、 [data-toggle="modal"]
$(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
  let target
  // thisは[data-toggle="modal"]が付与されているelement
  // [data-toggle="modal"]要素で指定されている['data-target"]かhrefを取得する
  // つまり、modal要素
  const selector = Util.getSelectorFromElement(this)

  // selectorが存在したら
  if (selector) {
    // targetにselectorを元に取得した要素を格納する
    target = document.querySelector(selector)
  }

  // $(target).data(DATA_KEY)が存在したら'toggle'を格納する
  // 存在していない場合は、
  const config = $(target).data(DATA_KEY)
    ? 'toggle' : {
      ...$(target).data(), // target(modal要素)のdata属性を全て取得
      ...$(this).data() // [data-toggle="modal"]が付与された要素のdata属性を全て取得
    }

    // thisのhtmlが<a>か<area>だったらブラウザのデフォルト動作を禁止する
    // <a>クリックでページが変わるとか
  if (this.tagName === 'A' || this.tagName === 'AREA') {
    event.preventDefault()
  }

  // modalのshowイベントをバインドしてshow時に無名関数を実行する
  const $target = $(target).one(Event.SHOW, (showEvent) => {
    // showEventがブラウザの動作を停止していたら
    if (showEvent.isDefaultPrevented()) {
      // modalが実際に表示される場合のみforcusする
      return
    }

    // modalのhiddenイベントをバインドして、hidden時に無名関数を実行する
    $target.one(Event.HIDDEN, () => {
      // thisは[data-toggle="modal"]が付与された要素
      // それが表示状態なら
      if ($(this).is(':visible')) {
        // focusする
        this.focus()
      }
    })
  })

  // configとthisはjQueryInterfaceに渡す引数
  Modal._jQueryInterface.call($(target), config, this)
})

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Modal._jQueryInterface
$.fn[NAME].Constructor = Modal
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return Modal._jQueryInterface
}

export default Modal
