(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('popper.js'), require('./util.js')) :
  typeof define === 'function' && define.amd ? define(['jquery', 'popper.js', './util.js'], factory) :
  (global = global || self, global.Tooltip = factory(global.jQuery, global.Popper, global.Util));
}(this, (function ($, Popper, Util) { 'use strict';

  $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
  Popper = Popper && Object.prototype.hasOwnProperty.call(Popper, 'default') ? Popper['default'] : Popper;
  Util = Util && Object.prototype.hasOwnProperty.call(Util, 'default') ? Util['default'] : Util;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.4.1): tools/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */
  var uriAttrs = ['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href'];
  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  var DefaultWhitelist = {
    // htmlタグにつけることを許可された属性達
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  };
  /**
   * 安全なURLのパターン
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */

  var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;
  /**
   * 安全なdataのURLパターン。画像、ビデオ、音声のみが一致する
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */

  var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i; // attrはhtmlの属性、allowedAttributeListは許可されている属性一覧

  function allowedAttribute(attr, allowedAttributeList) {
    // attrの属性とかを小文字で取得する
    var attrName = attr.nodeName.toLowerCase(); // allowedAttributeListにattrNameがあるか探す。なかったら-1が帰ってくる

    if (allowedAttributeList.indexOf(attrName) !== -1) {
      // uriAttrsにattrNameがあるか探す
      if (uriAttrs.indexOf(attrName) !== -1) {
        // 値が真偽か判定して真偽を返す
        // attrの中で安全なURLと安全なdataURLと一致するものがあったらtrue
        // なかったらfalse
        return Boolean(attr.nodeValue.match(SAFE_URL_PATTERN) || attr.nodeValue.match(DATA_URL_PATTERN));
      } // 属性がなかったらtrueを返す。処理はここで終わり


      return true;
    } // allowedAttributeListから正規表現として使える文字を選別


    var regExp = allowedAttributeList.filter(function (attrRegex) {
      return attrRegex instanceof RegExp;
    }); // attrNameの中にregExpとマッチするものがあるか確認

    for (var i = 0, l = regExp.length; i < l; i++) {
      if (attrName.match(regExp[i])) {
        return true;
      }
    }

    return false;
  }

  function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
    // unsafeHtmlがなかったらそのまま返す
    if (unsafeHtml.length === 0) {
      return unsafeHtml;
    } // sanitizeFnがtrueで、functionならsanitizeFnを実行して返す


    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeHtml);
    }

    var domParser = new window.DOMParser(); // DOMツリー作成

    var createdDocument = domParser.parseFromString(unsafeHtml, 'text/html'); // whitelistのキーをwhitelistKeysに入れる

    var whitelistKeys = Object.keys(whiteList); // createdDocumentの要素を1個ずつ取得する

    var elements = [].slice.call(createdDocument.body.querySelectorAll('*')); // エレメントの数だけ回すよ

    var _loop = function _loop(i, len) {
      // elにelementsのi番目を入れる
      var el = elements[i]; // nodeNameを小文字で取得する
      // 取得するnodeNameには、Classも含まれる

      var elName = el.nodeName.toLowerCase(); // el.nodeNameがwhitelistKeysにあるか判定。
      // '*'には一致しないんだね

      if (whitelistKeys.indexOf(el.nodeName.toLowerCase()) === -1) {
        // elを削除
        el.parentNode.removeChild(el); // forの条件式に戻る

        return "continue";
      } // elの属性を取得
      // roleとかclass


      var attributeList = [].slice.call(el.attributes); // whiteList[*]は全部に適用されるので、基本入れる
      // whiteList[elName]は該当するelementがあれば入れる
      // []は多分区切り

      var whitelistedAttributes = [].concat(whiteList['*'] || [], whiteList[elName] || []); // attributeList(htmlについてたclassとかの属性)

      attributeList.forEach(function (attr) {
        // attrが許可された属性か判定
        if (!allowedAttribute(attr, whitelistedAttributes)) {
          // 許可されてなかったらElementsから属性を削除
          el.removeAttribute(attr.nodeName);
        }
      });
    };

    for (var i = 0, len = elements.length; i < len; i++) {
      var _ret = _loop(i);

      if (_ret === "continue") continue;
    } // サニタイズしたHTMLを返却


    return createdDocument.body.innerHTML;
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'tooltip';
  var VERSION = '4.4.1';
  var DATA_KEY = 'sc.tooltip';
  var EVENT_KEY = "." + DATA_KEY;
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var CLASS_PREFIX = 'sc-tooltip';
  var SCCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];
  var DefaultType = {
    animation: 'boolean',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string',
    delay: '(number|object)',
    html: 'boolean',
    selector: '(string|boolean)',
    placement: '(string|function)',
    offset: '(number|string|function)',
    container: '(string|element|boolean)',
    fallbackPlacement: '(string|array)',
    boundary: '(string|element)',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    whiteList: 'object',
    popperConfig: '(null|object)'
  };
  var AttachmentMap = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left'
  };
  var Default = {
    animation: true,
    template: '<div class="tooltip" role="tooltip">' + '<div class="arrow"></div>' + '<div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    selector: false,
    placement: 'top',
    offset: 0,
    container: false,
    fallbackPlacement: 'flip',
    boundary: 'scrollParent',
    sanitize: true,
    sanitizeFn: null,
    whiteList: DefaultWhitelist,
    popperConfig: null
  };
  var HoverState = {
    SHOW: 'show',
    OUT: 'out'
  };
  var Event = {
    HIDE: "hide" + EVENT_KEY,
    HIDDEN: "hidden" + EVENT_KEY,
    SHOW: "show" + EVENT_KEY,
    SHOWN: "shown" + EVENT_KEY,
    INSERTED: "inserted" + EVENT_KEY,
    CLICK: "click" + EVENT_KEY,
    FOCUSIN: "focusin" + EVENT_KEY,
    FOCUSOUT: "focusout" + EVENT_KEY,
    MOUSEENTER: "mouseenter" + EVENT_KEY,
    MOUSELEAVE: "mouseleave" + EVENT_KEY
  };
  var ClassName = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector = {
    TOOLTIP: '.tooltip',
    TOOLTIP_INNER: '.tooltip-inner',
    ARROW: '.arrow'
  };
  var Trigger = {
    HOVER: 'hover',
    FOCUS: 'focus',
    CLICK: 'click',
    MANUAL: 'manual'
  };

  var Tooltip = /*#__PURE__*/function () {
    // elementは data-toggle="tooltip"が付与されたelement
    // configはobject(config)かfalse
    function Tooltip(element, config) {
      // popperがなかったら、throw
      if (typeof Popper === 'undefined') {
        throw new TypeError('Simplicss\'s tooltips require Popper.js (https://popper.js.org/)');
      } // private


      this._isEnabled = true;
      this._timeout = 0;
      this._hoverState = '';
      this._activeTrigger = {};
      this._popper = null; // Protected

      this.element = element;
      this.config = this._getConfig(config);
      this.tip = null;

      this._setListeners();
    } // Getters


    var _proto = Tooltip.prototype;

    // Public
    _proto.enable = function enable() {
      this._isEnabled = true;
    };

    _proto.disable = function disable() {
      this._isEnabled = false;
    };

    _proto.toggleEnabled = function toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    };

    _proto.toggle = function toggle(event) {
      // this._isEnabledがfalseなら処理終了
      if (!this._isEnabled) {
        return;
      } // イベントが存在した場合


      if (event) {
        // dataKeyを格納
        var dataKey = this.constructor.DATA_KEY; // event.currentTargetからdataKeyの値を取得（Tooltipのclass）

        var context = $(event.currentTarget).data(dataKey); // contextがなかったら再設定する

        if (!context) {
          context = new this.constructor(event.currentTarget, this._getDelegateConfig());
          $(event.currentTarget).data(dataKey, context);
        } // event.currentTargetの逆の値を格納


        context._activeTrigger.click = !context._activeTrigger.click; // _activeTriggerがtrueだったら

        if (context._isWithActiveTrigger()) {
          // showの処理
          context._enter(null, context);
        } else {
          // falseならhideの処理
          context._leave(null, context);
        }
      } else {
        // _activeTriggerがfalseの場合
        // tipelementがshowクラスを持っていたら
        if ($(this.getTipElement()).hasClass(ClassName.SHOW)) {
          // hide処理を実行
          this._leave(null, this); // 処理終了


          return;
        } // showを持っていなかったらshowをする


        this._enter(null, this);
      }
    };

    _proto.dispose = function dispose() {
      // タイムアウトを削除
      clearTimeout(this._timeout); // this.elementに紐付いているdataを削除（Tooltipクラス）

      $.removeData(this.element, this.constructor.DATA_KEY); // this.elementに紐付いているイベントを削除

      $(this.element).off(this.constructor.EVENT_KEY); // .modalに紐付いているイベントも削除

      $(this.element).closest('.modal').off('hide.sc.modal', this._hideModalHandler); // this.tipがあったら削除

      if (this.tip) {
        $(this.tip).remove();
      } // 各設定を削除


      this._isEnabled = null;
      this._timeout = null;
      this._hoverState = null;
      this._activeTrigger = null;

      if (this._popper) {
        this._popper.destroy();
      }

      this._popper = null;
      this.element = null;
      this.config = null;
      this.tip = null;
    };

    _proto.show = function show() {
      var _this = this;

      // 対象のElementsがdisplay:noneだったらエラーにする
      if ($(this.element).css('display') === 'none') {
        throw new Error('Please use show on visible elements');
      } // showEventにshow.sc.tooltipを入れる


      var showEvent = $.Event(this.constructor.Event.SHOW); // titleが存在していて、isEnableがtrue

      if (this.isWithContent() && this._isEnabled) {
        // showイベントを発動する
        $(this.element).trigger(showEvent); // this,.elementに関連するshadow dowのrootを取得する

        var shadowRoot = Util.findShadowRoot(this.element); // jQuery.contains( 対象の要素 ,含まれているか調べたい要素 )

        var isInTheDom = $.contains( // shadowRootがnullじゃなかったらshadowRootが対象の要素
        // nullだった場合は、this.elementを内包するトップレベルのdocument(bodyとか)
        shadowRoot !== null ? shadowRoot : this.element.ownerDocument.documentElement, this.element // this.elementを探す
        ); // showイベントがブラウザの動作を停止している
        // もしくは、this.elementがdomにない場合は処理終了

        if (showEvent.isDefaultPrevented() || !isInTheDom) {
          return;
        } // tip elementの取得


        var tip = this.getTipElement(); // 固有IDを取得

        var tipId = Util.getUID(this.constructor.NAME); // tipに対して、固有のIDを設定

        tip.setAttribute('id', tipId); // this.elementに対して、tipIDを設定

        this.element.setAttribute('aria-describedby', tipId); // tipにコンテンツの内容を設定する。あとshowとfadeクラスがあったら削除する

        this.setContent(); // animationがtrueの場合

        if (this.config.animation) {
          // fadeクラスを付与する
          $(tip).addClass(ClassName.FADE);
        } // placementがfunctionなら、実行する
        // functionじゃない場合は、this.config.placementを入れる


        var placement = typeof this.config.placement === 'function' ? this.config.placement.call(this, tip, this.element) : this.config.placement; // AttachmentMapから該当するplacementを取得する

        var attachment = this._getAttachment(placement); // sc-tooltip-topなどのクラスを付与する


        this.addAttachmentClass(attachment); // body要素を取得する

        var container = this._getContainer(); // tipにthis(tooltip)データを設定する


        $(tip).data(this.constructor.DATA_KEY, this); // this.element.ownerDocument.documentElementはhtml要素
        // this.tipはtooltip
        // htmlにtolltipの要素があるか確認する

        if (!$.contains(this.element.ownerDocument.documentElement, this.tip)) {
          // htmlにthis.tipが含まれていなかったらtipをcontainer(body要素)に追加する
          // ここでhtmlに要素を追加して、tooltipを表示してる
          $(tip).appendTo(container);
        } // inserted.sc.tooltipはツールチップテンプレートがDOMに追加されたときに show.sc.tooltip イベントの後に発動。


        $(this.element).trigger(this.constructor.Event.INSERTED); // this.popperをインスタンス化
        // popperは位置調整

        this._popper = new Popper(this.element, tip, this._getPopperConfig(attachment)); // tipにshowクラスを設定する

        $(tip).addClass(ClassName.SHOW); // iOSのために、空のマウスオーバリスナーを追加
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

        if ('ontouchstart' in document.documentElement) {
          $(document.body).children().on('mouseover', null, $.noop);
        }

        var complete = function complete() {
          // animationがtrueの場合
          if (_this.config.animation) {
            // popperで定義した表示位置を調整してる
            _this._fixTransition();
          } // hoverStateを代入


          var prevHoverState = _this._hoverState; // hoverStateをnullにする

          _this._hoverState = null; // shownイベントを実行する

          $(_this.element).trigger(_this.constructor.Event.SHOWN); // prevHoverStateがoutなら

          if (prevHoverState === HoverState.OUT) {
            // hoveroutしたときにhideする関数
            _this._leave(null, _this);
          }
        }; // tipがfadeクラスをもってたら


        if ($(this.tip).hasClass(ClassName.FADE)) {
          // tip要素から遷移時間を取得
          var transitionDuration = Util.getTransitionDurationFromElement(this.tip); // tipに一度だけ(one)実行されるcompleteをバインド

          $(this.tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
        } else {
          // そのままcompleteを実行
          complete();
        }
      }
    };

    _proto.hide = function hide(callback) {
      var _this2 = this;

      // tipのelementを取得
      var tip = this.getTipElement(); // hideイベントを定義

      var hideEvent = $.Event(this.constructor.Event.HIDE);

      var complete = function complete() {
        // tipのHoverStateがshowじゃなく、tipにparentNodeが存在する場合
        if (_this2._hoverState !== HoverState.SHOW && tip.parentNode) {
          // parentNodeからtipを削除する
          tip.parentNode.removeChild(tip);
        } // tipからsc-tooltipと名のつくクラスを削除する


        _this2._cleanTipClass(); // this.elementはdata-toggle="tooltip"がついている要素


        _this2.element.removeAttribute('aria-describedby'); // hiddenイベントを発動


        $(_this2.element).trigger(_this2.constructor.Event.HIDDEN); // popperが存在していたら

        if (_this2._popper !== null) {
          // popperを破棄する
          _this2._popper.destroy();
        } // 引数のcallbackがあったら


        if (callback) {
          // callbackを実行する
          callback();
        }
      }; // hideイベントを実行する


      $(this.element).trigger(hideEvent); // hideイベントがブラウザの機能を停止していたら
      // 処理終了

      if (hideEvent.isDefaultPrevented()) {
        return;
      } // tipからshowクラスを削除する


      $(tip).removeClass(ClassName.SHOW); // iOSのために、空のマウスオーバリスナーを追加
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

      if ('ontouchstart' in document.documentElement) {
        $(document.body).children().off('mouseover', null, $.noop);
      } // activeTriggerのclick、focus、hoverをfalseにする


      this._activeTrigger[Trigger.CLICK] = false;
      this._activeTrigger[Trigger.FOCUS] = false;
      this._activeTrigger[Trigger.HOVER] = false; // tipがfadeクラスを持ってたら

      if ($(this.tip).hasClass(ClassName.FADE)) {
        // tip要素から遷移時間を取得
        var transitionDuration = Util.getTransitionDurationFromElement(tip); // tipに一度だけ(one)実行されるcompleteをバインド

        $(tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        // fadeを持ってなかったらそのまま実行
        complete();
      } // hoverStateに空文字を入れる


      this._hoverState = '';
    };

    _proto.update = function update() {
      // popperのスケジュールをアップデートする
      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    } // Protected
    ;

    _proto.isWithContent = function isWithContent() {
      // titleが存在しているか判定
      return Boolean(this.getTitle());
    } // AttachmentMapから取得したtooltipが出る場所
    ;

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      // tipのelementにsc-tooltip-topなどのクラスを付与する
      $(this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      // this.tipはHTML elementのtooltip
      // this.config.templateは、Defaultのtooltipテンプレート
      this.tip = this.tip || $(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      // tipのelementを取得する
      var tip = this.getTipElement(); // tipにテキストを設定する

      this.setElementContent($(tip.querySelectorAll(Selector.TOOLTIP_INNER)), this.getTitle()); // tipからfadeとshowクラスを削除する

      $(tip).removeClass(ClassName.FADE + " " + ClassName.SHOW);
    } // elementは.tooltip-inner
    // contentはtitle
    ;

    _proto.setElementContent = function setElementContent($element, content) {
      // コンテンツがオブジェクトで、content.nodeTypeまたはcontent.jqueryが存在するか
      if (typeof content === 'object' && (content.nodeType || content.jquery)) {
        // contentがDOMノードまたはjQuery
        // config.htmlがfalse以外の場合
        if (this.config.html) {
          // contentの親要素が.tooltip-innerの場合
          if (!$(content).parent().is($element)) {
            // .tooltip-innerの子要素を全て削除してcontentを追加する
            $element.empty().append(content);
          }
        } else {
          // elementのテキストをcontentのテキストにする
          $element.text($(content).text());
        }

        return;
      } // config.htmlが存在する場合


      if (this.config.html) {
        // contentをサニタイズ
        if (this.config.sanitize) {
          content = sanitizeHtml(content, this.config.whiteList, this.config.sanitizeFn);
        } // elementのhtmlをcontentに変更


        $element.html(content);
      } else {
        // elementのtextをcontentにする
        $element.text(content);
      }
    };

    _proto.getTitle = function getTitle() {
      // elementのタイトルを取得
      var title = this.element.getAttribute('data-original-title'); // タイトルが存在しなかったら

      if (!title) {
        // this.config,titleがfunctionなら実行してその結果を返す
        // 単純にtitleがなかったらDefaultのtitleを使う
        title = typeof this.config.title === 'function' ? this.config.title.call(this.element) : this.config.title;
      }

      return title;
    } // Private
    // 引数は表示位置(topとか)
    ;

    _proto._getPopperConfig = function _getPopperConfig(attachment) {
      var _this3 = this;

      // defaultのconfig
      var defaultScConfig = {
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
        onCreate: function onCreate(data) {
          if (data.originalPlacement !== data.placement) {
            // popperの表示位置を設定する
            _this3._handlePopperPlacementChange(data);
          }
        },
        onUpdate: function onUpdate(data) {
          return _this3._handlePopperPlacementChange(data);
        }
      };
      return _objectSpread2({}, defaultScConfig, {}, this.config.popperConfig);
    };

    _proto._getOffset = function _getOffset() {
      var _this4 = this;

      var offset = {}; // offsetがfunctionなら

      if (typeof this.config.offset === 'function') {
        // dataはpopperみたい
        offset.fn = function (data) {
          // popperのoffsetに、展開して入れる
          data.offsets = _objectSpread2({}, data.offsets, {}, _this4.config.offset(data.offsets, _this4.element) || {});
          return data;
        };
      } else {
        // configのoffsetを代入
        offset.offset = this.config.offset;
      }

      return offset;
    };

    _proto._getContainer = function _getContainer() {
      if (this.config.container === false) {
        // body要素を返す
        return document.body;
      }

      if (Util.isElement(this.config.container)) {
        return $(this.config.container);
      }

      return $(document).find(this.config.container);
    };

    _proto._getAttachment = function _getAttachment(placement) {
      // AttachmentMapから該当するplacementを取得する
      return AttachmentMap[placement.toUpperCase()];
    };

    _proto._setListeners = function _setListeners() {
      var _this5 = this;

      // this.config.triggerを' '(半角スペース)で分割する
      // Defaultならhoverとfocusになる
      var triggers = this.config.trigger.split(' '); // triggerの分だけ繰り返す

      triggers.forEach(function (trigger) {
        // triggerがclickだったら
        if (trigger === 'click') {
          $(_this5.element).on( // click.sc.tooltip
          _this5.constructor.Event.CLICK, // Defaultはfalse
          _this5.config.selector, function (event) {
            return _this5.toggle(event);
          } // toggleさせる
          );
        } else if (trigger !== Trigger.MANUAL) {
          // Triggerがmanualじゃなかったら。(hoverかfocus)
          // triggerがhoverか判定
          var eventIn = trigger === Trigger.HOVER ? _this5.constructor.Event.MOUSEENTER // trueはmouseenter.sc.tooltipを入れる
          : _this5.constructor.Event.FOCUSIN; // falseはfocusin.sc.tooltipを入れる
          // triggerがhoverか判定

          var eventOut = trigger === Trigger.HOVER ? _this5.constructor.Event.MOUSELEAVE // trueはmouseleave.sc.tooltipを入れる
          : _this5.constructor.Event.FOCUSOUT; // trueはfoucusout.sc.tooltipを入れる

          $(_this5.element).on(eventIn, // mouseenter.sc.tooltip
          _this5.config.selector, // Defaultはfalse
          function (event) {
            return _this5._enter(event);
          } // showさせる
          ).on(eventOut, // mouseleave.sc.tooltip
          _this5.config.selector, // Defaultはfalse
          function (event) {
            return _this5._leave(event);
          } // hideさせる
          );
        }
      }); // _hideModalHandlerを定義

      this._hideModalHandler = function () {
        // this.elementがあったら
        if (_this5.element) {
          // elementをhideする
          _this5.hide();
        }
      }; // tooltip付近のmodalに対して、hide.sc.modalを設定


      $(this.element).closest('.modal').on('hide.sc.modal', this._hideModalHandler); // this.config.selectorがtrueだったら

      if (this.config.selector) {
        this.config = _objectSpread2({}, this.config, {
          // this.configを展開して格納
          trigger: 'manual',
          // triggerをmanualに設定
          selector: '' // selectorは空文字にする

        });
      } else {
        // falseならfixTitleを実行
        this._fixTitle();
      }
    };

    _proto._fixTitle = function _fixTitle() {
      // data-original-titleを取得して、そのTypeを判定
      var titleType = typeof this.element.getAttribute('data-original-title'); // this.elementにtitleが存在していて、titleTypeがstringじゃない場合

      if (this.element.getAttribute('title') || titleType !== 'string') {
        this.element.setAttribute('data-original-title', this.element.getAttribute('title') || '' // title属性があるならtitle属性の値で、無いなら空文字
        ); // this.elementのtitle属性を空文字にする

        this.element.setAttribute('title', '');
      }
    } // eventはmouseoverとかのイベント
    ;

    _proto._enter = function _enter(event, context) {
      // dataKeyにsc.tooltipを入れる
      var dataKey = this.constructor.DATA_KEY; // event.currentTargetはtooltipが付与されているelement
      // 引数のcontextか、jQueryInterfaceでelementに入れたやつを入れる

      context = context || $(event.currentTarget).data(dataKey); // contextが存在しているか確認

      if (!context) {
        // contextがない場合は、tooltipのコンストラクタを読んどくみたい
        context = new this.constructor( // tooltipが付与されたelement
        event.currentTarget, // defaultにないtooltip.configを追加する
        this._getDelegateConfig()); // tooltipが付与された要素に対して、sc.tooltipのデータキーで
        // context(tooltipのインスタンス)を入れる

        $(event.currentTarget).data(dataKey, context);
      } // eventが存在してたら


      if (event) {
        // event.typeがfocusinだったら、focusをtrueにする
        // focusinじゃなかったらhoverをtrueにする
        context._activeTrigger[event.type === 'focusin' ? Trigger.FOCUS : Trigger.HOVER] = true;
      } // div.tooltipがshowクラスを持っているもしくは、contextの_hoverStateがshowだった場合


      if ($(context.getTipElement()).hasClass(ClassName.SHOW) || context._hoverState === HoverState.SHOW) {
        // context._hoverStateにshowを入れる
        context._hoverState = HoverState.SHOW;
        return;
      } // setTimeout()を使用して設定された遅延処理を取り消す


      clearTimeout(context._timeout); // context._hoverStateにshowを入れる

      context._hoverState = HoverState.SHOW; // context.config.delayが存在していなくて、delay.showが0の場合

      if (!context.config.delay || !context.config.delay.show) {
        // showを発動
        context.show(); // 処理終了

        return;
      } // context._timeoutにdelay.showの分だけ遅らせたshowを発動する


      context._timeout = setTimeout(function () {
        // hoverStateがshowの場合
        if (context._hoverState === HoverState.SHOW) {
          context.show();
        }
      }, context.config.delay.show);
    };

    _proto._leave = function _leave(event, context) {
      // datakeyを取得
      var dataKey = this.constructor.DATA_KEY; // 引数にもよるけど、contextはtootip。それかイベントのcurrentTarget(datakey)の値

      context = context || $(event.currentTarget).data(dataKey); // contextが存在してなかったら

      if (!context) {
        context = new this.constructor( // tooltipが付与されたelement
        event.currentTarget, // ユーザ側でconfigが設定されてたら上書きする
        this._getDelegateConfig()); // eventのcurrentTargetにcontextを設定する

        $(event.currentTarget).data(dataKey, context);
      } // eventが存在していたら


      if (event) {
        // event.typeがfocusoutだったらfucusに対してfalseを設定
        // 違っかたらhoverに対してfalseを設定
        context._activeTrigger[event.type === 'focusout' ? Trigger.FOCUS : Trigger.HOVER] = false;
      } // _activeTriggerがtrueなら処理終了


      if (context._isWithActiveTrigger()) {
        return;
      } // タイムアウトを削除


      clearTimeout(context._timeout); // hoverStateにoutを設定

      context._hoverState = HoverState.OUT; // delayが0か、delay.hideが存在してなかったら

      if (!context.config.delay || !context.config.delay.hide) {
        // tolltipのhideを実行して処理終了
        context.hide();
        return;
      } // delay.hideの分だけhideを遅らせて発動


      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.OUT) {
          context.hide();
        }
      }, context.config.delay.hide);
    };

    _proto._isWithActiveTrigger = function _isWithActiveTrigger() {
      // this._activeTrigger分回す
      for (var trigger in this._activeTrigger) {
        // trueだったら
        if (this._activeTrigger[trigger]) {
          // trueを返す
          return true;
        }
      } // .activeTriggerがfalseしかなかったり、forで回すための
      // 値がなかったらfalseを返す


      return false;
    } // configはobject(config)かfalse
    ;

    _proto._getConfig = function _getConfig(config) {
      // sc.tooltipとか
      // placementとかtoggleの指定があればそれも
      var dataAttributes = $(this.element).data(); // dataAttributesのキーを取得してその分ループしまくる

      Object.keys(dataAttributes).forEach(function (dataAttr) {
        // 禁止されているdataAttrがないか存在しているか確認。
        // ['sanitize', 'whiteList', 'sanitizeFn']
        if (DISALLOWED_ATTRIBUTES.indexOf(dataAttr) !== -1) {
          // 存在している場合はそのdataAttrを削除する
          delete dataAttributes[dataAttr];
        }
      });
      config = _objectSpread2({}, this.constructor.Default, {}, dataAttributes, {}, typeof config === 'object' && config ? config : {}); // config.delayがnumberだった場合

      if (typeof config.delay === 'number') {
        config.delay = {
          // config.delayのshowとhideに
          // config.delayの値を代入
          show: config.delay,
          hide: config.delay
        };
      } // config.titleがnumberだった場合
      // Stringに変換する


      if (typeof config.title === 'number') {
        config.title = config.title.toString();
      } // config.cotentがnumberだった場合
      // Stringに変換する


      if (typeof config.content === 'number') {
        config.content = config.content.toString();
      } // configの各値のtypeがDefaultTypeの通りになっているか確認
      // 例えば、configのanimationの型はbooleanかどうかとか


      Util.typeCheckConfig(NAME, config, this.constructor.DefaultType); // config.sanitizeがtrueなら
      // Defaultはtrue

      if (config.sanitize) {
        // config.sanitizeFnはDefaultはfalse
        // config.whiteListはsanitaizer.jsのwhitelist
        config.template = sanitizeHtml(config.template, config.whiteList, config.sanitizeFn);
      } // configを返す


      return config;
    };

    _proto._getDelegateConfig = function _getDelegateConfig() {
      var config = {};

      if (this.config) {
        // tooltipのconfigのkey分だけfor
        for (var key in this.config) {
          // Defaultのkeyの値と、this.configのkeyの値が不一致だったら
          if (this.constructor.Default[key] !== this.config[key]) {
            // configのkeyに、this.configのkeyの値を入れる
            config[key] = this.config[key];
          }
        }
      }

      return config;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      // tipの要素を取得
      var $tip = $(this.getTipElement()); // tipのclassにマッチしているものがあるか確認

      var tabClass = $tip.attr('class').match(SCCLS_PREFIX_REGEX); // tabClassに値があったら

      if (tabClass !== null && tabClass.length) {
        // TabClassに該当するクラスを全て削除する
        $tip.removeClass(tabClass.join(''));
      }
    } // popperの表示位置を変更するとかの処理だと思う
    ;

    _proto._handlePopperPlacementChange = function _handlePopperPlacementChange(popperData) {
      // popperのインスタンスを格納
      var popperInstance = popperData.instance;
      this.tip = popperInstance.popper; // tipからクラスを削除する

      this._cleanTipClass(); // popperData.placementから取得した表示位置クラスを設定する


      this.addAttachmentClass(this._getAttachment(popperData.placement));
    };

    _proto._fixTransition = function _fixTransition() {
      // tipのelementを取得
      var tip = this.getTipElement(); // configのanimetionを取得

      var initConfigAnimation = this.config.animation; // tipにx-placementがなかったら処理終了

      if (tip.getAttribute('x-placement') !== null) {
        return;
      } // tipのfadeクラスを削除する


      $(tip).removeClass(ClassName.FADE); // configのanimetionをfalseにする

      this.config.animation = false; // tolltipのhideを実行

      this.hide(); // tolltipのshowを実行

      this.show(); // config.animationにanimationを再設定

      this.config.animation = initConfigAnimation;
    } // Static
    // 引数はtooltip({container: $('#customContainer')[0]})とかのオブジェクト
    // あと、tooltip('show')のshowとか
    ;

    Tooltip._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // $('#target').tooltipみたいな形な記述があればtooltipが入る
        // その時、configに指定された値が入る。placement : 'top'とか
        var data = $(this).data(DATA_KEY); // configがobjectならobjectを_configに入れる
        // それ以外(undefinedとかshowとか)ならfalseを入れる

        var _config = typeof config === 'object' && config; // dataがundefinedで、configがdisposeまたは、hideにマッチする場合
        // 処理を終了する


        if (!data && /dispose|hide/.test(config)) {
          return;
        } // dataがundefinedの場合


        if (!data) {
          // dataにインスタンス化したTooltipを入れる
          // thisはdata-toggle="tooltip"が指定されてるelements
          // _configはfalseかobject
          data = new Tooltip(this, _config); // elementsに対して、sc.tooltipって名前でdata(tooltipのインスタンス)
          // を設定する

          $(this).data(DATA_KEY, data);
        } // configがstringの場合(showとか)


        if (typeof config === 'string') {
          // tooltipsにconfigと同じ名前のメソッドがあるか判定
          // 存在しない場合は、ないよっていう
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          } // throwされなかった場合は、configと同じ名前のメソッドを実行する


          data[config]();
        }
      });
    };

    _createClass(Tooltip, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType;
      }
    }]);

    return Tooltip;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME] = Tooltip._jQueryInterface;
  $.fn[NAME].Constructor = Tooltip;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Tooltip._jQueryInterface;
  };

  return Tooltip;

})));
//# sourceMappingURL=tooltip.js.map
