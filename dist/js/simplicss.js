(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery'), require('popper.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'jquery', 'popper.js'], factory) :
  (global = global || self, factory(global.simplicss = {}, global.jQuery, global.Popper));
}(this, (function (exports, $, Popper) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
  Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

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
   * simplicss (v4.3.1): util.js
   * Licensed under MIT (https://github.com/twbs/simplicss/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Private TransitionEnd Helpers
   * ------------------------------------------------------------------------
   */
  // transitionendイベント用で変数になってるのはprefixをつけるから？

  var TRANSITION_END = 'transitionend';
  var MAX_UID = 1000000;
  var MILLISECONDS_MULTIPLIER = 1000; // Shoutout AngusCroll (https://goo.gl/pxwQGp)
  // オブジェクトの型を判定する

  function toType(obj) {
    return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
  } //


  function getSpecialTransitionEndEvent() {
    return {
      bindType: TRANSITION_END,
      delegateType: TRANSITION_END,
      handle: function handle(event) {
        if ($(event.target).is(this)) {
          return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
        }

        return undefined; // eslint-disable-line no-undefined
      }
    };
  } // transitionの遷移時間を引数でもらう


  function transitionEndEmulator(duration) {
    var _this = this;

    var called = false; // 呼び出しもとのエレメントでTRANSITION_ENDで一度だけ実行

    $(this).one(Util.TRANSITION_END, function () {
      // コールバックをtrueにする
      called = true;
    });
    setTimeout(function () {
      // falseだったらtriggerTransitionEndを実行する
      if (!called) {
        Util.triggerTransitionEnd(_this);
      }
    }, duration); // settimeoutの時間は引数の遷移時間
    // エレメントを返す

    return this;
  }

  function setTransitionEndSupport() {
    // Jqueryのカスタムプラグインを作成
    $.fn.emulateTransitionEnd = transitionEndEmulator;
    $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
  }
  /**
   * --------------------------------------------------------------------------
   * Public Util Api
   * --------------------------------------------------------------------------
   */


  var Util = {
    TRANSITION_END: 'scTransitionEnd',
    // prefixはNAME(tooltipだとtooltipとか)
    getUID: function getUID(prefix) {
      do {
        // eslint-disable-next-line no-bitwise
        prefix += ~~(Math.random() * MAX_UID); // ランダムな値を生成
      } while (document.getElementById(prefix)); // 一致するIDの分だけ続行


      return prefix;
    },
    getSelectorFromElement: function getSelectorFromElement(element) {
      // 引数elementのdata-target属性の値を取得
      var selector = element.getAttribute('data-target'); // data-targetが存在しないか#の場合

      if (!selector || selector === '#') {
        // 引数elementのhref属性の値を取得
        var hrefAttr = element.getAttribute('href'); // hrefAttrがあったら#かどうかを判定して、trueならhrefAttrをtrimして返す。falseなら、空文字を入れる
        // trim: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/trim

        selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : '';
      }

      try {
        // html内のdata-targetもしくはhregで指定されているselectorを返す
        // data-targetの対象を返す
        // なかったらnullを返す
        return document.querySelector(selector) ? selector : null;
      } catch (err) {
        // エラーになったらnullを返す
        return null;
      }
    },
    // 要素から遷移時間を取得
    getTransitionDurationFromElement: function getTransitionDurationFromElement(element) {
      // エレメントがなかったら0を返す
      if (!element) {
        return 0;
      } // transition-durationとtransition-delayの値を取得


      var transitionDuration = $(element).css('transition-duration');
      var transitionDelay = $(element).css('transition-delay'); // 浮動小数点を取得

      var floatTransitionDuration = parseFloat(transitionDuration);
      var floatTransitionDelay = parseFloat(transitionDelay); // cssプロパティ、値がなければ0を返す

      if (!floatTransitionDuration && !floatTransitionDelay) {
        return 0;
      } // 複数値が指定されてたら最初の1つだけ取得する


      transitionDuration = transitionDuration.split(',')[0];
      transitionDelay = transitionDelay.split(',')[0]; // 変化にかかる時間(transitionDuration)と変化が始める時間(transitionDelay)を足して1000をかけて(秒にする)返す

      return (parseFloat(transitionDuration) + parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER; // ×1000する
    },
    reflow: function reflow(element) {
      return element.offsetHeight;
    },
    // 引数エレメントでtrainsition_endイベントを実行する
    triggerTransitionEnd: function triggerTransitionEnd(element) {
      $(element).trigger(TRANSITION_END);
    },
    // TODO: Remove in v5
    supportsTransitionEnd: function supportsTransitionEnd() {
      return Boolean(TRANSITION_END);
    },
    // 引数がdom要素か判定する
    // 違う場合はundefinedを返す
    isElement: function isElement(obj) {
      return (obj[0] || obj).nodeType;
    },
    // configの値がDefaultType
    typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
      // default typeの分だけループ
      // dropdownだとoffset、flipなどなど
      for (var property in configTypes) {
        // Object.prototype.hasOwnPropertyはオブジェクトにpropertyがあるか判定する
        // offsetプロパティが、configTypesにあるか
        if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
          // configTypesからプロパティの値を取得(正規表現で使う文字列)
          var expectedTypes = configTypes[property]; // configの中からpropertyの値を取得

          var value = config[property]; // valueが存在してdom要素だった場合は文字列(element)を格納
          // falseの場合は型を判定して格納

          var valueType = value && Util.isElement(value) ? 'element' : toType(value); //  expectedTypesの正規表現に、valueTypeが一致しているか確認

          if (!new RegExp(expectedTypes).test(valueType)) {
            // 一致してなかったらthrowする
            throw new Error(componentName.toUpperCase() + ": " + ("Option \"" + property + "\" provided type \"" + valueType + "\" ") + ("but expected type \"" + expectedTypes + "\"."));
          }
        }
      }
    },
    findShadowRoot: function findShadowRoot(element) {
      // shadow domが関連付けされてないときはnullを返す
      if (!document.documentElement.attachShadow) {
        return null;
      } // elementのgetRootNodeがfunctionなら


      if (typeof element.getRootNode === 'function') {
        // elementのroot要素を取得
        var root = element.getRootNode(); // rootがshadowrootのインスタンスならrootを返す。
        // そうじゃない場合はnullを返す

        return root instanceof ShadowRoot ? root : null;
      } // elementがshadow domのインスタンス
      // つまりshadow domの要素だったら、elementを返す


      if (element instanceof ShadowRoot) {
        return element;
      } // shadow domのルートが探せない場合はnullを返す


      if (!element.parentNode) {
        return null;
      } // elementのparentNodeに対して同じ操作を繰り返す


      return Util.findShadowRoot(element.parentNode);
    },
    jQueryDetection: function jQueryDetection() {
      if (typeof $ === 'undefined') {
        throw new TypeError('simplicss\'s JavaScript requires jQuery. jQuery must be included before simplicss\'s JavaScript.');
      }

      var version = $.fn.jquery.split(' ')[0].split('.');
      var minMajor = 1;
      var ltMajor = 2;
      var minMinor = 9;
      var minPatch = 1;
      var maxMajor = 4;

      if (version[0] < ltMajor && version[1] < minMinor || version[0] === minMajor && version[1] === minMinor && version[2] < minPatch || version[0] >= maxMajor) {
        throw new Error('simplicss\'s JavaScript requires at least jQuery v1.9.1 but less than v4.0.0');
      }
    }
  };
  Util.jQueryDetection();
  setTransitionEndSupport();

  var NAME = 'alert';
  var VERSION = '0.5.2';
  var DATA_KEY = 'sc.alert'; // アラート閉じた時のイベントとかに使うみたい
  // http://bootstrap3.cyberlab.info/javascript/alerts-events.html

  var EVENT_KEY = "." + DATA_KEY; // イベントを無効にする用
  // https://getbootstrap.jp/docs/4.1/getting-started/javascript/

  var DATA_API_KEY = '.data-api'; // 他のフレームワークと名前衝突を回避する用

  var JQUERY_NO_CONFLICT = $.fn[NAME]; // アラート消す用

  var Selector = {
    DISMISS: '[data-dismiss="alert"]'
  }; // イベント用の名前
  // e.g. close.sc.alert

  var Event = {
    CLOSE: "close" + EVENT_KEY,
    CLOSED: "closed" + EVENT_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
  }; // htmlのクラス名

  var ClassName = {
    ALERT: 'alert',
    FADE: 'fade',
    SHOW: 'show'
  };

  var Alert =
  /*#__PURE__*/
  function () {
    function Alert(element) {
      this._element = element;
    } // バージョンのゲッター


    var _proto = Alert.prototype;

    // public method
    _proto.close = function close(element) {
      // このクラス内のthisはalertクラス
      // コンストラクタで取得したelement
      var rootElement = this._element; // closeにelementが引数で渡されていたら

      if (element) {
        // div.alertを取得
        rootElement = this._getRootElement(element);
      } // カスタムイベントを作成


      var customEvent = this._triggerCloseEvent(rootElement); // イベントがブラウザの処理を禁止していた場合は闇に葬り去る
      // http://www.jquerystudy.info/reference/events/isDefaultPrevented.html


      if (customEvent.isDefaultPrevented()) {
        return;
      } // showクラスを削除する
      // fadeクラスがなかった場合、要素を削除する


      this._removeElement(rootElement);
    } // this._elementを削除するみたい
    ;

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      this._element = null;
    } // private method
    // closeで使ってるやつ
    ;

    _proto._getRootElement = function _getRootElement(element) {
      // elementのdata-targetもしくはhrefで指定されているselectorを取得
      var selector = Util.getSelectorFromElement(element);
      var parent = false; // selectorがあった場合

      if (selector) {
        // data-targetもしくはhrefで指定されている要素を取得
        // 開始タグから終了タグまで持ってくるみたい
        parent = document.querySelector(selector);
      } // 上のifを通らなかったか通ってもnullが帰ってきた場合


      if (!parent) {
        // data-targetもしくはhrefが指定されてないので、一番近い.alertを取得する
        parent = $(element).closest("." + ClassName.ALERT)[0];
      }

      return parent;
    } // closeで使ってるやつ
    ;

    _proto._triggerCloseEvent = function _triggerCloseEvent(element) {
      // close.sc.alertイベントを定義
      var closeEvent = $.Event(Event.CLOSE);
      $(element).trigger(closeEvent); // closeイベントを発生
      // closeEvent返すんか

      return closeEvent;
    } // closeで使ってるやつ
    ;

    _proto._removeElement = function _removeElement(element) {
      var _this = this;

      // showクラスを削除
      $(element).removeClass(ClassName.SHOW); // fadeクラスを持ってなかった場合

      if (!$(element).hasClass(ClassName.FADE)) {
        // アラートを削除
        this._destroyElement(element);

        return; // eslint-disable-line no-useless-return
      } // 要素の変化にかかる時間を取得


      var transitionDuration = Util.getTransitionDurationFromElement(element);
      $(element) // .oneは一回だけ実行するイベント。TRANSITION_ENDはイベント名。
      // エレメントを削除してclosedイベントを実行する
      .one(Util.TRANSITION_END, function (event) {
        return _this._destroyElement(element, event);
      }) // util.jsのtransitionEndEmulatorを実行
      .emulateTransitionEnd(transitionDuration);
    } // _removeElementで使ってるやつ
    ;

    _proto._destroyElement = function _destroyElement(element) {
      $(element) // elementを。。。
      .detach() // elementを隔離
      .trigger(Event.CLOSED) // closedイベントを発生させる
      .remove(); // element削除
      // https://qiita.com/BRSF/items/1aa9d154bde497b0baa0#remove%E3%81%AE%E5%A0%B4%E5%90%88
    } // static
    ;

    Alert._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // elementを格納
        var $element = $(this); // elementのdata-sc.alert属性を取得

        var data = $element.data(DATA_KEY); // dataがなかったら

        if (!data) {
          // アラートをインスタンス化
          // thisはelement
          data = new Alert(this); // elementにdata-sc.alertを設定
          // 中身はdata

          $element.data(DATA_KEY, data);
        } // configがcloseだったら・・・・


        if (config === 'close') {
          // alert.close(element)になる
          data[config](this);
        }
      });
    };

    Alert._handleDismiss = function _handleDismiss(alertInstance) {
      return function (event) {
        // イベントがあったら
        if (event) {
          // イベントの動作を停止させる
          event.preventDefault();
        } // 引数で受け取ったalertインスタンスのcloseを実行
        // 引数はhtmlのbutton


        alertInstance.close(this);
      };
    };

    _createClass(Alert, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);

    return Alert;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Apiの定義
   * ------------------------------------------------------------------------
   */
  // ここがブラウザで使う部分みたい


  $(document).on(Event.CLICK_DATA_API, // click.sc.alert.data-api
  Selector.DISMISS, // [data-dismiss="alert"]
  Alert._handleDismiss(new Alert()) // staticのやつ実行するんだね
  );
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  // .alertは_jQueryInterface

  $.fn[NAME] = Alert._jQueryInterface; // .alert.ConstructorはAlert

  $.fn[NAME].Constructor = Alert; // .alert.noConflict
  // 衝突回避用

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Alert._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$1 = 'button';
  var VERSION$1 = '0.5.2';
  var DATA_KEY$1 = 'sc.button';
  var EVENT_KEY$1 = "." + DATA_KEY$1;
  var DATA_API_KEY$1 = '.data-api';
  var JQUERY_NO_CONFLICT$1 = $.fn[NAME$1];
  var ClassName$1 = {
    ACTIVE: 'active',
    BUTTON: 'btn',
    FOCUS: 'focus'
  };
  var Selector$1 = {
    DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
    DATA_TOGGLES: '[data-toggle="buttons"]',
    DATA_TOGGLE: '[data-toggle="button"]',
    DATA_TOGGLES_BUTTONS: '[data-toggle="buttons"] .btn',
    INPUT: 'input:not([type="hidden"])',
    ACTIVE: '.active',
    BUTTON: '.btn'
  };
  var Event$1 = {
    CLICK_DATA_API: "click" + EVENT_KEY$1 + DATA_API_KEY$1,
    FOCUS_BLUR_DATA_API: "focus" + EVENT_KEY$1 + DATA_API_KEY$1 + " " + ("blur" + EVENT_KEY$1 + DATA_API_KEY$1),
    LOAD_DATA_API: "load" + EVENT_KEY$1 + DATA_API_KEY$1
  };
  /**
   * ------------------------------------------------------------------------
   * クラス
   * ------------------------------------------------------------------------
   */

  var Button =
  /*#__PURE__*/
  function () {
    function Button(element) {
      this._element = element;
    } // バージョンのゲッター


    var _proto = Button.prototype;

    // toggleメソッド
    _proto.toggle = function toggle() {
      var triggerChangeEvent = true;
      var addAriaPressed = true; // '[data-toggle="buttons"]'をもつ要素の親要素を取得する

      var rootElement = $(this._element).closest(Selector$1.DATA_TOGGLES)[0]; // rootElementがあったら

      if (rootElement) {
        // hiddenじゃないinputを取得する
        var input = this._element.querySelector(Selector$1.INPUT); // inputがあった場合


        if (input) {
          // inputがradioだった場合
          if (input.type === 'radio') {
            // .classList.contains(クラス名)が存在するか確認する
            // radioがチェックされててかつ、.activeクラスが存在する場合。
            if (input.checked && this._element.classList.contains(ClassName$1.ACTIVE)) {
              // .activeなボタンを押したらfalseにする
              triggerChangeEvent = false;
            } else {
              // .activeを持つ要素を取得する。
              var activeElement = rootElement.querySelector(Selector$1.ACTIVE); // activeElementが存在してたら

              if (activeElement) {
                // .activeクラスを削除する
                $(activeElement).removeClass(ClassName$1.ACTIVE);
              }
            } // inputがcheckboxだったら

          } else if (input.type === 'checkbox') {
            // this._elementのタグ名が<label>でかつ、.activeクラスを持っていたら
            if (this._element.tagName === 'LABEL' && input.checked === this._element.classList.contains(ClassName$1.ACTIVE)) {
              triggerChangeEvent = false;
            }
          } else {
            // radioもしくはcheckboxじゃない場合、pointless/invalid checkedをinputに追加しちゃあかん
            triggerChangeEvent = false;
          } // .activeクラスを持っていない場合の処理


          if (triggerChangeEvent) {
            // アクティブを持っていないか確認
            input.checked = !this._element.classList.contains(ClassName$1.ACTIVE); // input要素に対してchangeを発動

            $(input).trigger('change');
          } // inputにfocusを当てる


          input.focus();
          addAriaPressed = false;
        }
      } // buttonがdisabled属性を持ってるまたは、disabledクラスを持っていた場合


      if (!(this._element.hasAttribute('disabled') || this._element.classList.contains('disabled'))) {
        // ボタンがinputじゃなかったら
        if (addAriaPressed) {
          // .activeがあったらaria-pressed属性にfalseなかったらtrue
          this._element.setAttribute('aria-pressed', !this._element.classList.contains(ClassName$1.ACTIVE));
        } // .activeクラスを持ってたら.activeを消す


        if (triggerChangeEvent) {
          $(this._element).toggleClass(ClassName$1.ACTIVE);
        }
      }
    } // this._elementを削除するみたい
    ;

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$1);
      this._element = null;
    } // Static
    ;

    Button._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // elementのdata-sc.buttonを取得
        var data = $(this).data(DATA_KEY$1); // dataがなかったら

        if (!data) {
          // buttonをインスタンス化
          // thisはエレメント
          data = new Button(this); // thisにdata-sc.alertを設定
          // 中身はボタンクラス

          $(this).data(DATA_KEY$1, data);
        } // configがtoggleだったら


        if (config === 'toggle') {
          // button.toggleになる
          data[config]();
        }
      });
    };

    _createClass(Button, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$1;
      }
    }]);

    return Button;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document) // click.sc.alert.data-api'と[data-toggle^="button"]'
  .on(Event$1.CLICK_DATA_API, Selector$1.DATA_TOGGLE_CARROT, function (event) {
    // イベント対象のelement
    var button = event.target; // イベント対象のelementが.btnを持ってたら

    if (!$(button).hasClass(ClassName$1.BUTTON)) {
      // .btnを持つ要素を取得する
      button = $(button).closest(Selector$1.BUTTON)[0];
    } // ボタンがない、ボタンがdisable属性またはクラスを持つ場合


    if (!button || button.hasAttribute('disabled') || button.classList.contains('disabled')) {
      // イベントを禁止にする
      event.preventDefault(); // firefoxのバグで指定しないとだめみたい
    } else {
      // hidden以外のinputボタンを取得
      var inputBtn = button.querySelector(Selector$1.INPUT); // inputボタンが存在してdisabled属性またはクラスを持ってたら

      if (inputBtn && (inputBtn.hasAttribute('disabled') || inputBtn.classList.contains('disabled'))) {
        // イベントを禁止にする
        event.preventDefault(); // firefoxのバグで指定しないとだめみたい

        return;
      } // ここわかりやすい
      // https://qiita.com/Chrowa3/items/b3e2961c4930abc1369b


      Button._jQueryInterface.call($(button), 'toggle');
    }
  }) // focus.sc.alert.data-api +  blur.sc.alert.data-api'と[data-toggle^="button"]'
  .on(Event$1.FOCUS_BLUR_DATA_API, Selector$1.DATA_TOGGLE_CARROT, function (event) {
    // button要素を取得する
    var button = $(event.target).closest(Selector$1.BUTTON)[0]; // button要素に対して、fucusクラスをつける
    // event,typeがfocusinならtrue、違うならfalse
    // trueなら絶対クラスを付与、falseなら削除

    $(button).toggleClass(ClassName$1.FOCUS, /^focus(in)?$/.test(event.type));
  }); // load.sc.alert.data-api'

  $(window).on(Event$1.LOAD_DATA_API, function () {
    // windowsロード時にボタンの状態を見て.activeを追加する
    // checkとかになってないのに.activeがついてたら削除する
    // data-toggle内のcheckboxとradioを見つける
    //  '[data-toggle="buttons"]をもつ .btn要素を全て取得する
    var buttons = [].slice.call(document.querySelectorAll(Selector$1.DATA_TOGGLES_BUTTONS)); // buttonsの数だけループ回すよ

    for (var i = 0, len = buttons.length; i < len; i++) {
      // ボタンのi番目
      var button = buttons[i]; // hidden以外のinputを取得

      var input = button.querySelector(Selector$1.INPUT); // inputがcheckされているか、checked属性を持っている場合

      if (input.checked || input.hasAttribute('checked')) {
        // .activeを追加する
        button.classList.add(ClassName$1.ACTIVE);
      } else {
        // check状態じゃなかったら削除
        button.classList.remove(ClassName$1.ACTIVE);
      }
    } //  全ての[data-toggle="button"]を取得する


    buttons = [].slice.call(document.querySelectorAll(Selector$1.DATA_TOGGLE));

    for (var _i = 0, _len = buttons.length; _i < _len; _i++) {
      var _button = buttons[_i]; // aria-pressedにtrueが指定されていたら

      if (_button.getAttribute('aria-pressed') === 'true') {
        _button.classList.add(ClassName$1.ACTIVE);
      } else {
        _button.classList.remove(ClassName$1.ACTIVE);
      }
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$1] = Button._jQueryInterface;
  $.fn[NAME$1].Constructor = Button;

  $.fn[NAME$1].noConflict = function () {
    $.fn[NAME$1] = JQUERY_NO_CONFLICT$1;
    return Button._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$2 = 'dropdown';
  var VERSION$2 = '0.5.2';
  var DATA_KEY$2 = 'sc.dropdown';
  var EVENT_KEY$2 = "." + DATA_KEY$2;
  var DATA_API_KEY$2 = '.data-api';
  var JQUERY_NO_CONFLICT$2 = $.fn[NAME$2];
  var ESCAPE_KEYCODE = 27; // Escキー

  var SPACE_KEYCODE = 32; // スペースキー

  var TAB_KEYCODE = 9; // タブキー

  var ARROW_UP_KEYCODE = 38; // ↑キー

  var ARROW_DOWN_KEYCODE = 40; // ↓キー

  var RIGHT_MOUSE_BUTTON_WHICH = 3; // マウスの右クリック
  // 正規表現オブジェクト作成

  var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE);
  var Event$2 = {
    HIDE: "hide" + EVENT_KEY$2,
    HIDDEN: "hidden" + EVENT_KEY$2,
    SHOW: "show" + EVENT_KEY$2,
    SHOWN: "shown" + EVENT_KEY$2,
    CLICK: "click" + EVENT_KEY$2,
    CLICK_DATA_API: "click" + EVENT_KEY$2 + DATA_API_KEY$2,
    KEYDOWN_DATA_API: "keydown" + EVENT_KEY$2 + DATA_API_KEY$2,
    KEYUP_DATA_API: "keyup" + EVENT_KEY$2 + DATA_API_KEY$2
  };
  var ClassName$2 = {
    DISABLED: 'disabled',
    SHOW: 'show',
    DROPUP: 'dropup',
    DROPRIGHT: 'dropright',
    DROPLEFT: 'dropleft',
    MENURIGHT: 'dropdown-menu-right',
    MENULEFT: 'dropdown-menu-left',
    POSITION_STATIC: 'position-static'
  };
  var Selector$2 = {
    DATA_TOGGLE: '[data-toggle="dropdown"]',
    FORM_CHILD: '.dropdown form',
    MENU: '.dropdown-menu',
    NAVBAR_NAV: '.navbar-nav',
    VISIBLE_ITEMS: '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)'
  };
  var AttachmentMap = {
    TOP: 'top-start',
    TOPEND: 'top-end',
    BOTTOM: 'bottom-start',
    BOTTOMEND: 'bottom-end',
    RIGHT: 'right-start',
    RIGHTEND: 'right-end',
    LEFT: 'left-start',
    LEFTEND: 'left-end'
  };
  var Default = {
    offset: 0,
    flip: true,
    boundary: 'scrollParent',
    reference: 'toggle',
    display: 'dynamic',
    popperConfig: null
  };
  var DefaultType = {
    offset: '(number|string|function)',
    flip: 'boolean',
    boundary: '(string|element)',
    reference: '(string|element)',
    display: 'string',
    popperConfig: '(null|object)'
  };
  /**
   * ------------------------------------------------------------------------
   * Class
   * ------------------------------------------------------------------------
   */

  var Dropdown =
  /*#__PURE__*/
  function () {
    // button.dropdown-toggleと、configがobjectならobject、違うならnull
    function Dropdown(element, config) {
      this._element = element;
      this._popper = null; // configを取得

      this._config = this._getConfig(config); // .dropdown-menuを取得

      this._menu = this._getMenuElement(); // dropdownがnavbarに内包されているか確認

      this._inNavbar = this._detectNavbar(); // クリックイベントの設定（ここでtoggleも登録）

      this._addEventListeners();
    } // Getters


    var _proto = Dropdown.prototype;

    _proto.toggle = function toggle() {
      // エレメントがdisable属性もしくはclassを持ってたら処理終了
      if (this._element.disabled || $(this._element).hasClass(ClassName$2.DISABLED)) {
        return;
      } // メニューが.showを持ってるか判定


      var isActive = $(this._menu).hasClass(ClassName$2.SHOW); // メニューを閉じる

      Dropdown._clearMenus(); // .showを持ってたらshowする必要ないので処理終了


      if (isActive) {
        return;
      } // 下のshowを発動。popperは使う


      this.show(true);
    };

    _proto.show = function show(usePopper) {
      if (usePopper === void 0) {
        usePopper = false;
      }

      // dropdownもしくはメニューがdisableになってたら処理終了
      if (this._element.disabled || $(this._element).hasClass(ClassName$2.DISABLED) || $(this._menu).hasClass(ClassName$2.SHOW)) {
        return;
      } // .dropdown-toggleをrelatedTargetに入れる


      var relatedTarget = {
        relatedTarget: this._element
      }; // show.sc.dropdownイベントを定義して、relatedTargetを渡す

      var showEvent = $.Event(Event$2.SHOW, relatedTarget); // エレメントの親要素を取得
      // .dropdown

      var parent = Dropdown._getParentFromElement(this._element); // parentに対してshoweventを発動する


      $(parent).trigger(showEvent); // ブラウザの処理を禁止してたら処理終了

      if (showEvent.isDefaultPrevented()) {
        return;
      } // navに入ってない状態でusepopperが使われる時


      if (!this._inNavbar && usePopper) {
        /**
         * Check for Popper dependency
         * Popper - https://popper.js.org
         */
        // popperが読み込まれているか確認
        if (typeof Popper === 'undefined') {
          throw new TypeError('Simplicss\'s dropdowns require Popper.js (https://popper.js.org/)');
        } // .data-toggle要素を格納


        var referenceElement = this._element; // this._configはDefault
        // parentだったら

        if (this._config.reference === 'parent') {
          // this._elementの親要素を格納する
          referenceElement = parent;
        } else if (Util.isElement(this._config.reference)) {
          // this._config.referenceがdom要素だったら
          // this._config.referenceを突っ込む
          referenceElement = this._config.reference; // jquery要素か確認する

          if (typeof this._config.reference.jquery !== 'undefined') {
            referenceElement = this._config.reference[0];
          }
        } // boundaryがscrollParentじゃない場合は、位置をstaticに設定してメニューが親をエスケープ出来るようにする


        if (this._config.boundary !== 'scrollParent') {
          // parentに.position-staticを追加
          $(parent).addClass(ClassName$2.POSITION_STATIC);
        } // popperをインスタンス化
        // referenceElementはdata-toggle、this._menuはメニュー、this._getPopperConfig()はpopperのコンフィグ
        // ちなみにここでdropdownメニューを表示している


        this._popper = new Popper(referenceElement, this._menu, this._getPopperConfig());
      } // タッチデバイスの場合、空のマウスオーバリスナーを追加


      if ('ontouchstart' in document.documentElement && $(parent).closest(Selector$2.NAVBAR_NAV).length === 0) {
        $(document.body).children().on('mouseover', null, $.noop);
      } // フォーカスさせる。キーイベントのため？


      this._element.focus(); // showのときはaria-expanded属性を付与してtrueを設定する


      this._element.setAttribute('aria-expanded', true); // menuの.showを切り替える


      $(this._menu).toggleClass(ClassName$2.SHOW); // parentの.showを切り替えて、表示後のイベントをrelatedTargerに対して発動する

      $(parent).toggleClass(ClassName$2.SHOW).trigger($.Event(Event$2.SHOWN, relatedTarget));
    };

    _proto.hide = function hide() {
      // disableクラス、属性も持っていた場合と、メニューがshowを持っていた場合は処理を終了させる
      if (this._element.disabled || $(this._element).hasClass(ClassName$2.DISABLED) || !$(this._menu).hasClass(ClassName$2.SHOW)) {
        return;
      } // this._elementをターゲットにする


      var relatedTarget = {
        relatedTarget: this._element
      }; // ターゲットに対してhideイベントを定義する

      var hideEvent = $.Event(Event$2.HIDE, relatedTarget); // .dropdownを取得する

      var parent = Dropdown._getParentFromElement(this._element); // 親要素に対してhideイベントを実行する


      $(parent).trigger(hideEvent); // hideイベントがブラウザの動作を止めていたら処理を終了する

      if (hideEvent.isDefaultPrevented()) {
        return;
      } // popperがあった場合は、削除する


      if (this._popper) {
        this._popper.destroy();
      } // this._menuのshowクラスを切り替える


      $(this._menu).toggleClass(ClassName$2.SHOW); // 親要素に対して、showクラスを切り替えて、hiddenイベントを発動する

      $(parent).toggleClass(ClassName$2.SHOW).trigger($.Event(Event$2.HIDDEN, relatedTarget));
    };

    _proto.dispose = function dispose() {
      // this_elementのdata-apiを削除する
      $.removeData(this._element, DATA_KEY$2); // this_elementのイベントを削除

      $(this._element).off(EVENT_KEY$2);
      this._element = null;
      this._menu = null; // popperがnullじゃなかったら、削除してnullにする

      if (this._popper !== null) {
        this._popper.destroy();

        this._popper = null;
      }
    };

    _proto.update = function update() {
      // dropdownがnavbarにあるか確認
      this._inNavbar = this._detectNavbar(); // popperがnullじゃなかったら

      if (this._popper !== null) {
        // popper要素の位置を変更
        this._popper.scheduleUpdate();
      }
    } // Private
    ;

    _proto._addEventListeners = function _addEventListeners() {
      var _this = this;

      // this_elementをクリックした時のイベントを定義する
      $(this._element).on(Event$2.CLICK, function (event) {
        // this._elementイベント禁止
        event.preventDefault(); // 親要素のイベントが実行されないようにeventの伝播を禁止する

        event.stopPropagation(); // toggleを発動する

        _this.toggle();
      });
    } // configを取得
    // 引数はtoggleだとnullでそうじゃなかったらobject
    ;

    _proto._getConfig = function _getConfig(config) {
      // configにdefaultの設定を$(this._element).data()、configの順に上書きしていく感じ
      config = _objectSpread2({}, this.constructor.Default, {}, $(this._element).data(), {}, config);
      Util.typeCheckConfig( // dropdown
      NAME$2, // 上で作ったconfigが入ってる
      config, // default typeがそのまま入ってる
      this.constructor.DefaultType);
      return config;
    };

    _proto._getMenuElement = function _getMenuElement() {
      // this._menuが存在しなかった場合
      if (!this._menu) {
        // this._elementの親要素を返す。div.dropdownとかbtn-groupとか
        var parent = Dropdown._getParentFromElement(this._element); // parentが存在していた場合


        if (parent) {
          // parentの中から.dropdown-menuを取得してthis._menuに格納する
          this._menu = parent.querySelector(Selector$2.MENU);
        }
      } // this._menuが存在してたらそのまま返す。
      // 存在してなかったら、取得して返す


      return this._menu;
    };

    _proto._getPlacement = function _getPlacement() {
      // this.elementの親要素を取得（.dropdown）
      var $parentDropdown = $(this._element.parentNode); // bottom-startを格納。初期値

      var placement = AttachmentMap.BOTTOM; // dropupを持ってたら

      if ($parentDropdown.hasClass(ClassName$2.DROPUP)) {
        // top-startを格納
        placement = AttachmentMap.TOP; // メニューがdropdown-menu-rightを持っていた場合

        if ($(this._menu).hasClass(ClassName$2.MENURIGHT)) {
          // top-endを格納
          placement = AttachmentMap.TOPEND;
        } // droprightを持っていた場合

      } else if ($parentDropdown.hasClass(ClassName$2.DROPRIGHT)) {
        // right-startを格納
        placement = AttachmentMap.RIGHT; // dropleftを持っていた場合
      } else if ($parentDropdown.hasClass(ClassName$2.DROPLEFT)) {
        // left-startを格納
        placement = AttachmentMap.LEFT; // dropdown-menu-rightを持っていた場合
      } else if ($(this._menu).hasClass(ClassName$2.MENURIGHT)) {
        // bottom-endを格納
        placement = AttachmentMap.BOTTOMEND;
      }

      return placement;
    };

    _proto._detectNavbar = function _detectNavbar() {
      // .navbar要素にdropdownが存在していないか確認
      return $(this._element).closest('.navbar').length > 0;
    };

    _proto._getOffset = function _getOffset() {
      var _this2 = this;

      var offset = {}; // this._config.offsetが関数だったら

      if (typeof this._config.offset === 'function') {
        // dataはpopperみたい
        offset.fn = function (data) {
          // data.offsetに展開して格納
          data.offsets = _objectSpread2({}, data.offsets, {}, _this2._config.offset(data.offsets, _this2._element) || {});
          return data;
        };
      } else {
        // offsetにthis._config.offsetを入れる
        offset.offset = this._config.offset;
      }

      return offset;
    };

    _proto._getPopperConfig = function _getPopperConfig() {
      // popperの設定を定義
      var popperConfig = {
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
      }; // this._config.displayがstaticの場合は、popperを無効化する

      if (this._config.display === 'static') {
        popperConfig.modifiers.applyStyle = {
          enabled: false
        };
      }

      return _objectSpread2({}, popperConfig, {}, this._config.popperConfig);
    } // Static
    // callの通り、configはtoggle
    ;

    Dropdown._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // こんな感じで使わないとdataには入らない
        // $('.dropdown-toggle').data('sc.dropdown', '')
        var data = $(this).data(DATA_KEY$2); // configはtoggleの場合はnullになる。

        var _config = typeof config === 'object' ? config : null;

        if (!data) {
          // thisはdropdown-toggle(button)
          // つまりelement
          data = new Dropdown(this, _config); // elementにsc.dropdownでdataをセットする

          $(this).data(DATA_KEY$2, data);
        } // toggleの場合はstring


        if (typeof config === 'string') {
          // dataのtoggleを指してるみたい
          if (typeof data[config] === 'undefined') {
            // toggleメソッドがなかったらスロー
            throw new TypeError("No method named \"" + config + "\"");
          } // toggle関数を発動する


          data[config]();
        }
      });
    };

    Dropdown._clearMenus = function _clearMenus(event) {
      // イベントが存在していてかつ、イベントがマウスの右クリックまたはキーを離した、またはタブキーじゃないものを押下した場合
      if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH || event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
        // 処理を終了する
        return;
      } //  '[data-toggle="dropdown"]'をもつ .要素を全て取得する


      var toggles = [].slice.call(document.querySelectorAll(Selector$2.DATA_TOGGLE)); // 取得したtogglesの数だけループ回す

      for (var i = 0, len = toggles.length; i < len; i++) {
        // togglesの親ノードを取得する
        var parent = Dropdown._getParentFromElement(toggles[i]); // toggle要素のsc.dropdownを取得する
        // jqueryInterfaceをで設定してdataを取得する（dataはdropdownのコンストラクタで定義した変数）


        var context = $(toggles[i]).data(DATA_KEY$2); // 連想配列にtoggleを追加

        var relatedTarget = {
          relatedTarget: toggles[i]
        }; // イベントが存在してイベントがclickだったら
        // bottonクリックのロキにイベントが発動してる

        if (event && event.type === 'click') {
          // relatedTargetのclickイベントにイベントを追加
          relatedTarget.clickEvent = event;
        } // sc.dropdownが存在していたら


        if (!context) {
          // 更新式に行く
          // つまり、クリックされてないものはcontextがないので、更新式に飛ばされて次のボタンの判定に入る
          continue;
        } // contextのmenuをdropdownmenuに代入


        var dropdownMenu = context._menu; // parentがshowクラスを持っていなかったら

        if (!$(parent).hasClass(ClassName$2.SHOW)) {
          // メニューが開いていないので、更新式に行く
          continue;
        } // イベントが存在してるのが前提
        // イベントがclickで、イベントのターゲットタグがinputもしくはtextareaまたは、イベントがキーを離してイベントキーがタブ以外でparentの中にイベントのターゲット要素が含まれている場合
        // /input|textarea/i.test(event.target.tagName) はmenu-itemがinputかtextareaの場合はtrue


        if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) && $.contains(parent, event.target)) {
          // parentにevent.targetが含まれているか。つまりparentのdropdownにクリックしたメニューが含まれているか
          // つまりmenuを閉じなくてもいいイベントの場合はメニューを閉じる処理しませんよってことみたい
          // 更新式に行く
          continue;
        } // hideイベントオブジェクトを定義する。
        // relatedTargetはイベント発生時に実行する関数に渡す値(data-toggle="dropdown"を持つ要素)
        // http://www.jquerystudy.info/reference/events/event.html


        var hideEvent = $.Event(Event$2.HIDE, relatedTarget); // parent要素に対して、hideEventを発生去せる
        // parentは.dropdown

        $(parent).trigger(hideEvent); // hideがブラウザの動作を停止していたら

        if (hideEvent.isDefaultPrevented()) {
          // 利用ユーザが特定の要素に対してe.preventDefault()みたいなのを書いたら処理をしない
          // 更新式に行く
          continue;
        } // タッチデバイスだった場合、iOS用のマウスオーバリスナーを削除


        if ('ontouchstart' in document.documentElement) {
          $(document.body).children().off('mouseover', null, $.noop);
        } // toggleに'aria-expanded=falseを設定


        toggles[i].setAttribute('aria-expanded', 'false'); // contextにpopperがあったら

        if (context._popper) {
          // popperインスタンスを削除
          context._popper.destroy();
        } // .dropdown-menuの.showを削除


        $(dropdownMenu).removeClass(ClassName$2.SHOW); // parentの.showを削除してhiddenイベントを定義しつつ発動
        // parentは.dropdown

        $(parent).removeClass(ClassName$2.SHOW).trigger($.Event(Event$2.HIDDEN, relatedTarget));
      }
    };

    Dropdown._getParentFromElement = function _getParentFromElement(element) {
      // elementがボタンの要素全部になってる
      var parent; // data-targetがないのでnullです。

      var selector = Util.getSelectorFromElement(element); // selectorが存在した場合

      if (selector) {
        // documentからselectorの要素を取得する
        parent = document.querySelector(selector);
      } // parentが存在していたらparentを返す
      // そうでなければ、elementのparentNodeで返す
      // parentNodeは親ノード


      return parent || element.parentNode;
    } // eslint-disable-next-line complexity
    ;

    Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
      // inputとtextareaの場合は、dropdownのコマンドを無効化する
      if (/input|textarea/i.test(event.target.tagName) ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE && (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE || $(event.target).closest(Selector$2.MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
        return;
      } // イベントを無効化して、伝藩しないようにする


      event.preventDefault();
      event.stopPropagation(); // disable属性または、disableクラスを持っていた場合、処理を終了する

      if (this.disabled || $(this).hasClass(ClassName$2.DISABLED)) {
        return;
      } // dropdownの親要素を取得する


      var parent = Dropdown._getParentFromElement(this); // parentが.showクラスを持っているか判定


      var isActive = $(parent).hasClass(ClassName$2.SHOW); // isActiveがfalseか、event.whichがエスケープキーだった場合、処理を終了させる

      if (!isActive && event.which === ESCAPE_KEYCODE) {
        return;
      } // isActiveがfalseまたは、isActiveがtrueかつエスケープキーが押下された場合もしくは、スペースキーが押下された場合


      if (!isActive || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {
        // エスキープキーだった場合
        if (event.which === ESCAPE_KEYCODE) {
          // parentのdata_toggleを持つ要素を取得
          var toggle = parent.querySelector(Selector$2.DATA_TOGGLE); // toggleをフォーカスする

          $(toggle).trigger('focus');
        } // クリップイベントを発動する


        $(this).trigger('click');
        return;
      } // disableしてないdropdown-menuとdropdown-itemを取得して、visibleのみを残す


      var items = [].slice.call(parent.querySelectorAll(Selector$2.VISIBLE_ITEMS)).filter(function (item) {
        return $(item).is(':visible');
      }); // itemsで取得したものがなかったら処理終了

      if (items.length === 0) {
        return;
      } // event.targetが何番目か取得する


      var index = items.indexOf(event.target); // 上キーが押されていて、indexが0よりおおきかったら

      if (event.which === ARROW_UP_KEYCODE && index > 0) {
        // indexを-1する
        index--;
      } // 下キーが押されていて、indexがindexの長さ-1より小さかったら


      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
        // indexを＋1する
        index++;
      } // indexが0より小さかったら


      if (index < 0) {
        // indexを0にする
        index = 0;
      } // drop-down-itemのindex番目をfucusする


      items[index].focus();
    };

    _createClass(Dropdown, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$2;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType;
      }
    }]);

    return Dropdown;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document) // data-toggle="dropdown"のキーイベントを登録
  .on(Event$2.KEYDOWN_DATA_API, Selector$2.DATA_TOGGLE, Dropdown._dataApiKeydownHandler) // .dropdown-menuのキーイベントを登録
  .on(Event$2.KEYDOWN_DATA_API, Selector$2.MENU, Dropdown._dataApiKeydownHandler) // メニュークリーンを登録
  .on(Event$2.CLICK_DATA_API + " " + Event$2.KEYUP_DATA_API, Dropdown._clearMenus) // [data-toggle="dropdown"]のイベント伝藩を止めて、jQueryInterfaceをcallする
  .on(Event$2.CLICK_DATA_API, Selector$2.DATA_TOGGLE, function (event) {
    event.preventDefault();
    event.stopPropagation();

    Dropdown._jQueryInterface.call($(this), 'toggle');
  }) // イベントが伝藩しないようにする
  .on(Event$2.CLICK_DATA_API, Selector$2.FORM_CHILD, function (e) {
    e.stopPropagation();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$2] = Dropdown._jQueryInterface;
  $.fn[NAME$2].Constructor = Dropdown;

  $.fn[NAME$2].noConflict = function () {
    $.fn[NAME$2] = JQUERY_NO_CONFLICT$2;
    return Dropdown._jQueryInterface;
  };

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

  var NAME$3 = 'tooltip';
  var VERSION$3 = '4.4.1';
  var DATA_KEY$3 = 'sc.tooltip';
  var EVENT_KEY$3 = "." + DATA_KEY$3;
  var JQUERY_NO_CONFLICT$3 = $.fn[NAME$3];
  var CLASS_PREFIX = 'sc-tooltip';
  var SCCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];
  var DefaultType$1 = {
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
  var AttachmentMap$1 = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left'
  };
  var Default$1 = {
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
  var Event$3 = {
    HIDE: "hide" + EVENT_KEY$3,
    HIDDEN: "hidden" + EVENT_KEY$3,
    SHOW: "show" + EVENT_KEY$3,
    SHOWN: "shown" + EVENT_KEY$3,
    INSERTED: "inserted" + EVENT_KEY$3,
    CLICK: "click" + EVENT_KEY$3,
    FOCUSIN: "focusin" + EVENT_KEY$3,
    FOCUSOUT: "focusout" + EVENT_KEY$3,
    MOUSEENTER: "mouseenter" + EVENT_KEY$3,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$3
  };
  var ClassName$3 = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$3 = {
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

  var Tooltip =
  /*#__PURE__*/
  function () {
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
        if ($(this.getTipElement()).hasClass(ClassName$3.SHOW)) {
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
          $(tip).addClass(ClassName$3.FADE);
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

        $(tip).addClass(ClassName$3.SHOW); // iOSのために、空のマウスオーバリスナーを追加
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


        if ($(this.tip).hasClass(ClassName$3.FADE)) {
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


      $(tip).removeClass(ClassName$3.SHOW); // iOSのために、空のマウスオーバリスナーを追加
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

      if ('ontouchstart' in document.documentElement) {
        $(document.body).children().off('mouseover', null, $.noop);
      } // activeTriggerのclick、focus、hoverをfalseにする


      this._activeTrigger[Trigger.CLICK] = false;
      this._activeTrigger[Trigger.FOCUS] = false;
      this._activeTrigger[Trigger.HOVER] = false; // tipがfadeクラスを持ってたら

      if ($(this.tip).hasClass(ClassName$3.FADE)) {
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

      this.setElementContent($(tip.querySelectorAll(Selector$3.TOOLTIP_INNER)), this.getTitle()); // tipからfadeとshowクラスを削除する

      $(tip).removeClass(ClassName$3.FADE + " " + ClassName$3.SHOW);
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
      // ekementのタイトルを取得
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
            element: Selector$3.ARROW
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
      return AttachmentMap$1[placement.toUpperCase()];
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
          });
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
      }); // _hideModalHandlerを適宜

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
        event.currentTarget, // ユーザ側でconfigが設定されてたら上書きするてきな
        this._getDelegateConfig()); // tooltipが付与された要素に対して、sc.tooltipのデータキーで
        // context(tooltipのインスタンス)を入れる

        $(event.currentTarget).data(dataKey, context);
      } // eventが存在してたら


      if (event) {
        // event.typeがfocusinだったら、focusをtrueにする
        // focusinじゃなかったらhoverをtrueにする
        context._activeTrigger[event.type === 'focusin' ? Trigger.FOCUS : Trigger.HOVER] = true;
      } // div.tooltipがshowクラスを持っているもしくは、contextの_hoverStateがshowだった場合


      if ($(context.getTipElement()).hasClass(ClassName$3.SHOW) || context._hoverState === HoverState.SHOW) {
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
      var dataAttributes = $(this.element).data(); // dataAttributesのキーを取得してその分ループしまくる

      Object.keys(dataAttributes).forEach(function (dataAttr) {
        // 禁止されているdataAttrがないか存在しているか確認。
        // ['sanitize', 'whiteList', 'sanitizeFn']=['sanitize', 'whiteList', 'sanitizeFn']
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


      Util.typeCheckConfig(NAME$3, config, this.constructor.DefaultType); // config.sanitizeがtrueなら
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
          // Defaultのkeyの値と、thiss.configのkeyの値が不一致だったら
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
      var $tip = $(this.getTipElement()); // tipののclassにマッチしているものがあるか確認

      var tabClass = $tip.attr('class').match(SCCLS_PREFIX_REGEX); // tabClassに値があったら

      if (tabClass !== null && tabClass.length) {
        // tipからクラスを削除する
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


      $(tip).removeClass(ClassName$3.FADE); // configのanimetionをfalseにする

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
        var data = $(this).data(DATA_KEY$3); // configがobjectならobjectを_configに入れる
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

          $(this).data(DATA_KEY$3, data);
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
        return VERSION$3;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$1;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME$3;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY$3;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event$3;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY$3;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$1;
      }
    }]);

    return Tooltip;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$3] = Tooltip._jQueryInterface;
  $.fn[NAME$3].Constructor = Tooltip;

  $.fn[NAME$3].noConflict = function () {
    $.fn[NAME$3] = JQUERY_NO_CONFLICT$3;
    return Tooltip._jQueryInterface;
  };

  exports.Alert = Alert;
  exports.Button = Button;
  exports.Dropdown = Dropdown;
  exports.Tooltip = Tooltip;
  exports.Util = Util;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=simplicss.js.map
