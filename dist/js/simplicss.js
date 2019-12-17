(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery'), require('popper.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'jquery', 'popper.js'], factory) :
  (global = global || self, factory(global.simplicss = {}, global.jQuery, global.Popper));
}(this, function (exports, $, Popper) { 'use strict';

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
        ownKeys(source, true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(source).forEach(function (key) {
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

    var called = false; // 呼び出しもとのエレメントでTRANSITION_ENDを実行

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
    getUID: function getUID(prefix) {
      do {
        // eslint-disable-next-line no-bitwise
        prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
      } while (document.getElementById(prefix));

      return prefix;
    },
    getSelectorFromElement: function getSelectorFromElement(element) {
      // 引数elementのdata-target属性の値を取得
      var selector = element.getAttribute('data-target'); // data-targetが存在しないか#の場合

      if (!selector || selector === '#') {
        // 引数elementのhref属性の値を取得
        var hrefAttr = element.getAttribute('href'); // hrefAttrがなかったら左のhrefAttrを返す=ifはfalseになり''が代入される
        // hrefAttrがあったら#かどうかを判定して、#じゃなかったらtrimする。
        // trim: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/trim

        selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : '';
      }

      try {
        // html内のdata-targetもしくはhregで指定されているselectorを返す
        // data-targetかtrimされたhrefのどっちか
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
    isElement: function isElement(obj) {
      return (obj[0] || obj).nodeType;
    },
    // Nameとconfigとdefauly typeでexpectedTypesとvalueTypeが一致しなかったら、エラーを投げる
    typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
      // default typeの分だけループ
      for (var property in configTypes) {
        // Object.prototype.hasOwnPropertyにconfigtypeのpropertyを渡す
        // Object.prototype.hasOwnPropertyはオブジェクトにpropertyがあるか判定する
        if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
          // configtypeのプロパティを取得
          var expectedTypes = configTypes[property]; // toggleを格納

          var value = config[property]; // valueが存在してdom要素だった場合はelementを格納
          // falseの場合は型を判定して格納

          var valueType = value && Util.isElement(value) ? 'element' : toType(value); //  expectedTypesとvalueTypeが一致しないか確認

          if (!new RegExp(expectedTypes).test(valueType)) {
            // エラーを投げる
            throw new Error(componentName.toUpperCase() + ": " + ("Option \"" + property + "\" provided type \"" + valueType + "\" ") + ("but expected type \"" + expectedTypes + "\"."));
          }
        }
      }
    },
    findShadowRoot: function findShadowRoot(element) {
      if (!document.documentElement.attachShadow) {
        return null;
      } // Can find the shadow root otherwise it'll return the document


      if (typeof element.getRootNode === 'function') {
        var root = element.getRootNode();
        return root instanceof ShadowRoot ? root : null;
      }

      if (element instanceof ShadowRoot) {
        return element;
      } // when we don't find a shadow root


      if (!element.parentNode) {
        return null;
      }

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
    // エレメントとtoggle
    function Dropdown(element, config) {
      this._element = element;
      this._popper = null; // configを取得

      this._config = this._getConfig(config); // .dropdown-menuを取得

      this._menu = this._getMenuElement(); // dropdownがnavbarに存在しているか確認

      this._inNavbar = this._detectNavbar(); // クリックイベントの設定

      this._addEventListeners();
    } // Getters


    var _proto = Dropdown.prototype;

    _proto.toggle = function toggle() {
      // エレメントがdisable属性もしくはclassを持ってたら処理終了
      if (this._element.disabled || $(this._element).hasClass(ClassName$2.DISABLED)) {
        return;
      } // メニューが.showを持ってるか判定


      var isActive = $(this._menu).hasClass(ClassName$2.SHOW); // メニューを閉じる

      Dropdown._clearMenus(); // .showを持ってたら処理終了


      if (isActive) {
        return;
      } // 下のshowを発動


      this.show(true);
    };

    _proto.show = function show(usePopper) {
      if (usePopper === void 0) {
        usePopper = false;
      }

      // dropdownもしくはメニューがdisableになってたら処理終了
      if (this._element.disabled || $(this._element).hasClass(ClassName$2.DISABLED) || $(this._menu).hasClass(ClassName$2.SHOW)) {
        return;
      } // showを指定するターゲットを指定


      var relatedTarget = {
        relatedTarget: this._element
      }; // show.sc.dropdownイベントを定義して、ターゲットを渡す

      var showEvent = $.Event(Event$2.SHOW, relatedTarget); // エレメントの親要素を取得

      var parent = Dropdown._getParentFromElement(this._element); // parentに対してshoweventを発動する


      $(parent).trigger(showEvent); // ブラウザの処理を禁止してたら処理終了

      if (showEvent.isDefaultPrevented()) {
        return;
      } // NavbarでドロップダウンのPopper.jsを完全に無効にする


      if (!this._inNavbar && usePopper) {
        /**
         * Check for Popper dependency
         * Popper - https://popper.js.org
         */
        // popperが読み込まれているか確認
        if (typeof Popper === 'undefined') {
          throw new TypeError('Simplicss\'s dropdowns require Popper.js (https://popper.js.org/)');
        } // エレメントを格納


        var referenceElement = this._element; // parentaだったら

        if (this._config.reference === 'parent') {
          // this._elementの親要素を格納する
          referenceElement = parent; // this._config.referenceがdom要素だったら
        } else if (Util.isElement(this._config.reference)) {
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


        this._popper = new Popper(referenceElement, this._menu, this._getPopperConfig());
      } // タッチデバイスの場合、空のマウスオーバリスナーを追加


      if ('ontouchstart' in document.documentElement && $(parent).closest(Selector$2.NAVBAR_NAV).length === 0) {
        $(document.body).children().on('mouseover', null, $.noop);
      } // フォーカスさせる。キーイベントのため？


      this._element.focus(); // aria-expanded属性を付与してtrueを設定する


      this._element.setAttribute('aria-expanded', true); // menueの.showを切り替える


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

      var hideEvent = $.Event(Event$2.HIDE, relatedTarget); // dropdownの親要素を取得する

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

        event.stopPropagation(); // 要素の表示を切り替える

        _this.toggle();
      });
    } // configを取得
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread2({}, this.constructor.Default, {}, $(this._element).data(), {}, config);
      Util.typeCheckConfig( // dropdown
      NAME$2, // toggle
      config, // default type
      this.constructor.DefaultType);
      return config;
    };

    _proto._getMenuElement = function _getMenuElement() {
      // this._menuが存在しなかった場合
      if (!this._menu) {
        // this._elementの親要素を返す
        var parent = Dropdown._getParentFromElement(this._element); // parentが存在していた場合


        if (parent) {
          // .dropdown-menuをthis._menuに格納する
          this._menu = parent.querySelector(Selector$2.MENU);
        }
      } // this._menuが存在してたらそのまま返す。
      // 存在してなかったら、取得して返す


      return this._menu;
    };

    _proto._getPlacement = function _getPlacement() {
      // this.elementの親要素を取得
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
    ;

    Dropdown._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$2);

        var _config = typeof config === 'object' ? config : null;

        if (!data) {
          data = new Dropdown(this, _config);
          $(this).data(DATA_KEY$2, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

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


        var context = $(toggles[i]).data(DATA_KEY$2); // 連想配列にtoggleを追加

        var relatedTarget = {
          relatedTarget: toggles[i]
        }; // イベントが存在してイベントがclickだったら

        if (event && event.type === 'click') {
          // relatedTargetのclickイベントにイベントを追加
          relatedTarget.clickEvent = event;
        } // sc.dropdownが存在していたら


        if (!context) {
          // 処理を継続する
          continue;
        } // contextのmenuをdropdownmenuに代入


        var dropdownMenu = context._menu; // parentがshowクラスを持ってたら

        if (!$(parent).hasClass(ClassName$2.SHOW)) {
          // 処理を継続
          continue;
        } // イベントが存在してるのが前提
        // イベントがclickで、イベントのターゲットタグがinputもしくはtextareaまたは、イベントがキーを離してイベントキーがタブ以外でparentの中にイベントのターゲット要素が含まれている場合


        if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) && $.contains(parent, event.target)) {
          // 処理を継続
          continue;
        } // hideイベントオブジェクトを定義する。
        // relatedTargetはイベント発生時に実行する関数に渡す値
        // http://www.jquerystudy.info/reference/events/event.html


        var hideEvent = $.Event(Event$2.HIDE, relatedTarget); // parent要素に対して、hideEventを発生去せる

        $(parent).trigger(hideEvent); // hideがブラウザの動作を停止していたら

        if (hideEvent.isDefaultPrevented()) {
          // 処理を継続する
          continue;
        } // タッチデバイスだった場合、iOS用のマウスオーバリスナーを削除


        if ('ontouchstart' in document.documentElement) {
          $(document.body).children().off('mouseover', null, $.noop);
        } // toggleに'aria-expanded=falseを設定


        toggles[i].setAttribute('aria-expanded', 'false'); // contextにpopperがあったら

        if (context._popper) {
          // 削除する
          context._popper.destroy();
        } // .dropdown-menuの.showを削除


        $(dropdownMenu).removeClass(ClassName$2.SHOW); // parentの.showを削除してhiddenイベントを定義しつつ発動

        $(parent).removeClass(ClassName$2.SHOW).trigger($.Event(Event$2.HIDDEN, relatedTarget));
      }
    };

    Dropdown._getParentFromElement = function _getParentFromElement(element) {
      var parent; // data-targetかtrimされたhrefのどっちかを返す

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
  .on(Event$2.KEYDOWN_DATA_API, Selector$2.MENU, Dropdown._dataApiKeydownHandler) // クリックイベントを登録
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

  exports.Alert = Alert;
  exports.Button = Button;
  exports.Dropdown = Dropdown;
  exports.Util = Util;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=simplicss.js.map
