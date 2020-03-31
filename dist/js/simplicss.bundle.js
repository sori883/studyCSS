(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
  typeof define === 'function' && define.amd ? define(['exports', 'jquery'], factory) :
  (global = global || self, factory(global.simplicss = {}, global.jQuery));
}(this, (function (exports, $) { 'use strict';

  $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;

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

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
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
    // jQueryのカスタムプラグインを作成
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
        // elementのhref属性の値を取得
        var hrefAttr = element.getAttribute('href'); // hrefAttrが存在していてかつ、#かどうかを判定して、trueならhrefAttrをtrimして返す。falseなら、空文字を入れる
        // trim: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/trim

        selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : '';
      }

      try {
        // html要素内にselectorで指定されている要素が存在するか判定
        // 存在していた場合、selectorを返す
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
      // 要素の高さを取得する
      // heightとpaddingとborderの合計値
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

  var Alert = /*#__PURE__*/function () {
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

  var Button = /*#__PURE__*/function () {
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

  var NAME$2 = 'collapse';
  var VERSION$2 = '4.4.1';
  var DATA_KEY$2 = 'sc.collapse';
  var EVENT_KEY$2 = "." + DATA_KEY$2;
  var DATA_API_KEY$2 = '.data-api';
  var JQUERY_NO_CONFLICT$2 = $.fn[NAME$2];
  var Default = {
    toggle: true,
    parent: ''
  };
  var DefaultType = {
    toggle: 'boolean',
    parent: '(string|element)'
  };
  var Event$2 = {
    SHOW: "show" + EVENT_KEY$2,
    SHOWN: "shown" + EVENT_KEY$2,
    HIDE: "hide" + EVENT_KEY$2,
    HIDDEN: "hidden" + EVENT_KEY$2,
    CLICK_DATA_API: "click" + EVENT_KEY$2 + DATA_API_KEY$2
  };
  var ClassName$2 = {
    SHOW: 'show',
    COLLAPSE: 'collapse',
    COLLAPSING: 'collapsing',
    COLLAPSED: 'collapsed'
  };
  var Dimension = {
    WIDTH: 'width',
    HEIGHT: 'height'
  };
  var Selector$2 = {
    ACTIVES: '.show, .collapsing',
    DATA_TOGGLE: '[data-toggle="collapse"]'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Collapse = /*#__PURE__*/function () {
    function Collapse(element, config) {
      this._isTransitioning = false;
      this._element = element; // cofigを取得

      this._config = this._getConfig(config); // data-toggle="collapse"を持っていて、hrefもしくはdata-targetを持ってる要素を取得する

      this._triggerArray = [].slice.call(document.querySelectorAll("[data-toggle=\"collapse\"][href=\"#" + element.id + "\"]," + ("[data-toggle=\"collapse\"][data-target=\"#" + element.id + "\"]"))); // [data-toggle="collapse"]を持つ要素を全て取得する

      var toggleList = [].slice.call(document.querySelectorAll(Selector$2.DATA_TOGGLE)); // 取得した[data-toggle="collapse"]を持つ要素の数だけループする

      for (var i = 0, len = toggleList.length; i < len; i++) {
        // [data-toggle="collapse"]要素を取り出す
        var elem = toggleList[i]; // elemのhrefで指定した値を取得

        var selector = Util.getSelectorFromElement(elem); // セレクターで指定された(クリックされた)要素で指定されているhrefのelementを取得

        var filterElement = [].slice.call(document.querySelectorAll(selector)).filter(function (foundElem) {
          return foundElem === element;
        }); // selectorが存在していて、filterElementも存在していた場合

        if (selector !== null && filterElement.length > 0) {
          // this._selectorにselector(hrefの値)を入れる
          this._selector = selector; // this._triggerArrayにelem([data-toggle="collapse"]を持つ要素)を入れる

          this._triggerArray.push(elem);
        }
      } // this._config.parentが存在していたらgetParentを実行する
      // 存在していなかったnullを入れる


      this._parent = this._config.parent ? this._getParent() : null; // config.parentが存在していなかったら

      if (!this._config.parent) {
        // 開閉する要素が.showを持っているかによって
        // trigger要素に.collapsedとaria-expanded属性を付与したり削除したりする
        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
      } // cofig.toggleがtrueだった場合


      if (this._config.toggle) {
        // Collapse.toggleを実行
        this.toggle();
      }
    } // Getters


    var _proto = Collapse.prototype;

    // Public
    _proto.toggle = function toggle() {
      // this._elementは開閉する要素
      // その要素がshowを持っている場合
      if ($(this._element).hasClass(ClassName$2.SHOW)) {
        // hideを実行
        this.hide();
      } else {
        // showを持っていない場合はshowを実行
        this.show();
      }
    };

    _proto.show = function show() {
      var _this = this;

      // this._isTransitioningがtrueもしくは、開閉対象の要素がshowを持っていたら
      // 処理を終了する
      if (this._isTransitioning || $(this._element).hasClass(ClassName$2.SHOW)) {
        return;
      }

      var actives;
      var activesData; // this._parentが存在していたら

      if (this._parent) {
        // parentから.showか.collapsingを持つ要素を取得する
        actives = [].slice.call(this._parent.querySelectorAll(Selector$2.ACTIVES)).filter(function (elem) {
          // this._config.parent要素がstringの場合
          if (typeof _this._config.parent === 'string') {
            // .activesの要素でdata-parent属性がthis._config.parentもののみを取得
            return elem.getAttribute('data-parent') === _this._config.parent;
          } // this._config.parent要素がstring以外の場合
          // elemのクラスリストにcollapseが存在するもののみを取得


          return elem.classList.contains(ClassName$2.COLLAPSE);
        }); // activesに要素が存在していない場合は、nullを代入する

        if (actives.length === 0) {
          actives = null;
        }
      } // activesがnullじゃない場合


      if (actives) {
        // activesからクリックされたtrigger要素のhrefで指定された要素を削除
        // 削除後に残ったactivesからDATA_KEYの値を取得する
        activesData = $(actives).not(this._selector).data(DATA_KEY$2); // activesDataが存在していて、activesData._isTransitioningがtrueなら
        // 処理終了

        if (activesData && activesData._isTransitioning) {
          return;
        }
      } // showイベントを定義


      var startEvent = $.Event(Event$2.SHOW); // showイベントを発動

      $(this._element).trigger(startEvent); // showイベントがブラウザのデフォルト動作を禁止していたら処理終了

      if (startEvent.isDefaultPrevented()) {
        return;
      } // activesが存在する場合


      if (actives) {
        // activesからthis._selectorで指定された要素を削除して、jQueryInterfaceでhideを実行
        // つまり、showするのと同時に既に開いている要素を閉じる
        Collapse._jQueryInterface.call($(actives).not(this._selector), 'hide'); // activeDataが存在しない場合


        if (!activesData) {
          // activesにDATA_KEYでnullを設定
          $(actives).data(DATA_KEY$2, null);
        }
      } // this._elementが.widthを持っていたらwidthを取得
      // もっていなかったらheightを取得


      var dimension = this._getDimension(); // this._element(開閉される要素)から.collapseを削除
      // そして、.collapsingを付与


      $(this._element).removeClass(ClassName$2.COLLAPSE).addClass(ClassName$2.COLLAPSING); // 開閉対象の高さを0pxにする

      this._element.style[dimension] = 0; // [data-toggle="collapse"]を持つ要素が0じゃない場合

      if (this._triggerArray.length) {
        // _triggerArrayの.collapsedを削除
        // aria-expandedをtrueで設定
        $(this._triggerArray).removeClass(ClassName$2.COLLAPSED).attr('aria-expanded', true);
      } // this._isTransitioningにtrueを設定


      this.setTransitioning(true);

      var complete = function complete() {
        // ここでshowをしている。詳細は_transitions.scssを確認だけど
        // 単純に.showを持っていない.collapse要素はdisplay:none;している
        // .collapsingを削除し、.collapseと.showを付与
        $(_this._element).removeClass(ClassName$2.COLLAPSING).addClass(ClassName$2.COLLAPSE).addClass(ClassName$2.SHOW); // 0に設定したstyleを空にする

        _this._element.style[dimension] = ''; // this._isTransitioningにfalseを設定

        _this.setTransitioning(false); // shownイベントを発動


        $(_this._element).trigger(Event$2.SHOWN);
      }; // dimensionの1文字目を大文字にする


      var capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      var scrollSize = "scroll" + capitalizedDimension; // 開閉する要素の遷移時間を取得

      var transitionDuration = Util.getTransitionDurationFromElement(this._element); // 開閉する要素

      $(this._element).one(Util.TRANSITION_END, complete) // 一度だけ発動するcomplete
      .emulateTransitionEnd(transitionDuration); // ここでTRANTION_ENDをtriggerしてる
      // this._elementのdimensionスタイルに、scrollSize分の値を適用する

      this._element.style[dimension] = this._element[scrollSize] + "px";
    };

    _proto.hide = function hide() {
      var _this2 = this;

      // this._isTransitioningがtrueもしくは、開閉対象の要素がshowを持っていなかったら
      // 処理を終了する
      if (this._isTransitioning || !$(this._element).hasClass(ClassName$2.SHOW)) {
        return;
      } // hideイベントを定義する


      var startEvent = $.Event(Event$2.HIDE); // hideイベントを発動する

      $(this._element).trigger(startEvent); // hideイベントがブラウザの動作を停止していたら処理終了

      if (startEvent.isDefaultPrevented()) {
        return;
      } // this._elementが.widthを持っていたらwidthを取得
      // もっていなかったらheightを取得


      var dimension = this._getDimension(); // getBoundingClientRectは要素の位置を取得する
      // つまり、開閉要素の位置(dimensionでheightかwidthを指定)を取得して
      // 開閉要素のスタイルに指定する


      this._element.style[dimension] = this._element.getBoundingClientRect()[dimension] + "px"; // 開閉要素の高さを取得する
      // heightとpaddingとborderの合計値

      Util.reflow(this._element); // 開閉要素に.collapsingを追加する
      // .collapseと.showは削除する

      $(this._element).addClass(ClassName$2.COLLAPSING).removeClass(ClassName$2.COLLAPSE).removeClass(ClassName$2.SHOW); // trigger要素の長さを取得

      var triggerArrayLength = this._triggerArray.length; // triggerArrayLengthが1以上だったら

      if (triggerArrayLength > 0) {
        // triggerArrayLengthの長さの分だけループする
        for (var i = 0; i < triggerArrayLength; i++) {
          // triggerArrayのひとつを取得
          var trigger = this._triggerArray[i]; // triggerに指定されている開閉要素を取得する

          var selector = Util.getSelectorFromElement(trigger); // selectorが存在していたら

          if (selector !== null) {
            // 開閉要素を全て取得して、配列で入れる
            var $elem = $([].slice.call(document.querySelectorAll(selector))); // 開閉要素がshowを持っていない場合

            if (!$elem.hasClass(ClassName$2.SHOW)) {
              // trrigerに.collapsedを追加する
              $(trigger).addClass(ClassName$2.COLLAPSED) // aria-expanded属性をfalseにする
              .attr('aria-expanded', false);
            }
          }
        }
      } // this._isTransitioningをtrueにする


      this.setTransitioning(true);

      var complete = function complete() {
        // this._isTransitioningをfalseにする
        _this2.setTransitioning(false); // 開閉要素に対して.collapsingを削除
        // .collapseを追加
        // Hiddenイベントを実行


        $(_this2._element).removeClass(ClassName$2.COLLAPSING).addClass(ClassName$2.COLLAPSE).trigger(Event$2.HIDDEN);
      }; // 開閉要素に設定したスタイルを空にする


      this._element.style[dimension] = ''; // this._elementから遷移時間を取得

      var transitionDuration = Util.getTransitionDurationFromElement(this._element); // .collapsingの遷移が終わったタイミングでcompleteを実行
      // emulateTransitionEndでTRANSITION_ENDを実行

      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
    };

    _proto.setTransitioning = function setTransitioning(isTransitioning) {
      // this._isTransitioningに引数を設定
      // trueかfalse
      this._isTransitioning = isTransitioning;
    } // 全てを破壊する
    ;

    _proto.dispose = function dispose() {
      // DATA_KEYを削除
      $.removeData(this._element, DATA_KEY$2); // 各要素にnullを代入して削除

      this._config = null;
      this._parent = null;
      this._element = null;
      this._triggerArray = null;
      this._isTransitioning = null;
    } // Private
    // configを取得する
    ;

    _proto._getConfig = function _getConfig(config) {
      // configにDefaultの値と、configの値を展開して入れる
      config = _objectSpread2({}, Default, {}, config);
      config.toggle = Boolean(config.toggle); // Stringをbooleanに変換する
      // confignの値がDefaultTypeの型と一致しているか確認

      Util.typeCheckConfig(NAME$2, config, DefaultType); // configを返す

      return config;
    };

    _proto._getDimension = function _getDimension() {
      // this._elementは開閉要素
      // this._elementが.widthを持っているか判定
      var hasWidth = $(this._element).hasClass(Dimension.WIDTH); // .widthが存在していたらwidthを返す
      // .widthが存在していなかったらheightを返す

      return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
    };

    _proto._getParent = function _getParent() {
      var _this3 = this;

      var parent; // this._config.parentがElementか判定する

      if (Util.isElement(this._config.parent)) {
        // Elementだった場合そのまま格納
        parent = this._config.parent; // jQuery object
        // this._config.parent.jqueryがundefinedじゃない場合

        if (typeof this._config.parent.jquery !== 'undefined') {
          // elementを格納
          parent = this._config.parent[0];
        }
      } else {
        // this._config.parentがElementじゃない場合
        // this._config.parentに指定されている要素を探して格納
        parent = document.querySelector(this._config.parent);
      } // [data-toggle="collapse"][data-parent="#accordion"]みたいになる


      var selector = "[data-toggle=\"collapse\"][data-parent=\"" + this._config.parent + "\"]"; // parent要素の中からselectorとマッチする要素を取得する
      // data-toggleとdata-parent両方持っている要素のみ

      var children = [].slice.call(parent.querySelectorAll(selector)); // elementはselectorと一致した要素

      $(children).each(function (i, element) {
        // 開閉する要素が.showを持っているかによって
        // trigger要素に.collapsedとaria-expanded属性を付与したり削除したりする
        _this3._addAriaAndCollapsedClass(Collapse._getTargetFromElement(element), // hrefとかに指定されている要素
        [element] // data-toggleとdata-parent両方持っている要素
        );
      }); // data-parent属性に指定された親要素を返す

      return parent;
    } // elementはhrefとかに指定されている開閉する要素
    // triggerArrayはelementを開閉させるためにクリックする要素
    ;

    _proto._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(element, triggerArray) {
      // elementがshowを持っているか判定
      var isOpen = $(element).hasClass(ClassName$2.SHOW); // triggerArrayに要素が入っているか判定

      if (triggerArray.length) {
        // elementがshowを持っていた場合は.collapsedを削除
        // elementがshowを持っていない場合は.collapsedを付与
        // aria-expanded属性にisOpenの値を設定
        $(triggerArray).toggleClass(ClassName$2.COLLAPSED, !isOpen).attr('aria-expanded', isOpen);
      }
    } // Static
    // elementはdata-toggleとdata-parent両方持っている要素
    ;

    Collapse._getTargetFromElement = function _getTargetFromElement(element) {
      // elementが持ってるhrefやdata-targetに指定されているselectorを取得
      var selector = Util.getSelectorFromElement(element); // selectorが存在していたら、selectorに指定されている要素を取得して返す
      // なかったらnullを返す

      return selector ? document.querySelector(selector) : null;
    };

    Collapse._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // selectorの要素(開閉する要素)
        var $this = $(this); // $thisのDATA_KEYと結びつくdata取得

        var data = $this.data(DATA_KEY$2); // configを格納

        var _config = _objectSpread2({}, Default, {}, $this.data(), {}, typeof config === 'object' && config ? config : {}); // dataが存在していないかつ、_config.toggleがtrue
        // configがshowまたはhideだった場合


        if (!data && _config.toggle && /show|hide/.test(config)) {
          // toggleをfalseにする
          _config.toggle = false;
        } // dataが存在してなかったらdataをインスタンス化する
        // インスタンス化したdataはDATA_KEYでElementに設定する


        if (!data) {
          // thisはdata-toggle="collapse"を持つ要素
          // _configは上で設定した_config
          data = new Collapse(this, _config);
          $this.data(DATA_KEY$2, data);
        } // configがstringだった場合


        if (typeof config === 'string') {
          // configメソッドがdata(collapseクラス)にあるか確認する
          if (typeof data[config] === 'undefined') {
            // なかったらエラーを返す
            throw new TypeError("No method named \"" + config + "\"");
          } // 存在していたら実行


          data[config]();
        }
      });
    };

    _createClass(Collapse, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$2;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }]);

    return Collapse;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */
  // DATA_TOGGLEに対して、クリックイベントを定義する


  $(document).on(Event$2.CLICK_DATA_API, Selector$2.DATA_TOGGLE, function (event) {
    // 折りたたみ可能な要素な要素ないではなく、<a>要素（URLを変更する）に対してのみ動作を停止する
    if (event.currentTarget.tagName === 'A') {
      event.preventDefault();
    } // thisはクリックしたelement(イベント要素)


    var $trigger = $(this); // セレクタを取得(#collapseOneとか)

    var selector = Util.getSelectorFromElement(this); // セレクタで指定された要素を取得

    var selectors = [].slice.call(document.querySelectorAll(selector));
    $(selectors).each(function () {
      // selectorで指定されているtoggleする要素
      var $target = $(this); // targetのDATA_KEYを取得する

      var data = $target.data(DATA_KEY$2); // configとdataが一致していたら$trigger.data()を入れる
      // それ以外の場合はtoggleを入れる
      // $trigger.data()は<a>のdata-toggleの値を取得する

      var config = data ? 'toggle' : $trigger.data(); // jqueryInterfaceを呼ぶ

      Collapse._jQueryInterface.call($target, config);
    });
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$2] = Collapse._jQueryInterface;
  $.fn[NAME$2].Constructor = Collapse;

  $.fn[NAME$2].noConflict = function () {
    $.fn[NAME$2] = JQUERY_NO_CONFLICT$2;
    return Collapse._jQueryInterface;
  };

  /**!
   * @fileOverview Kickass library to create and place poppers near their reference elements.
   * @version 1.16.1
   * @license
   * Copyright (c) 2016 Federico Zivolo and contributors
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */
  var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined';

  var timeoutDuration = function () {
    var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
    for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
      if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
        return 1;
      }
    }
    return 0;
  }();

  function microtaskDebounce(fn) {
    var called = false;
    return function () {
      if (called) {
        return;
      }
      called = true;
      window.Promise.resolve().then(function () {
        called = false;
        fn();
      });
    };
  }

  function taskDebounce(fn) {
    var scheduled = false;
    return function () {
      if (!scheduled) {
        scheduled = true;
        setTimeout(function () {
          scheduled = false;
          fn();
        }, timeoutDuration);
      }
    };
  }

  var supportsMicroTasks = isBrowser && window.Promise;

  /**
  * Create a debounced version of a method, that's asynchronously deferred
  * but called in the minimum time possible.
  *
  * @method
  * @memberof Popper.Utils
  * @argument {Function} fn
  * @returns {Function}
  */
  var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

  /**
   * Check if the given variable is a function
   * @method
   * @memberof Popper.Utils
   * @argument {Any} functionToCheck - variable to check
   * @returns {Boolean} answer to: is a function?
   */
  function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }

  /**
   * Get CSS computed property of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Eement} element
   * @argument {String} property
   */
  function getStyleComputedProperty(element, property) {
    if (element.nodeType !== 1) {
      return [];
    }
    // NOTE: 1 DOM access here
    var window = element.ownerDocument.defaultView;
    var css = window.getComputedStyle(element, null);
    return property ? css[property] : css;
  }

  /**
   * Returns the parentNode or the host of the element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} parent
   */
  function getParentNode(element) {
    if (element.nodeName === 'HTML') {
      return element;
    }
    return element.parentNode || element.host;
  }

  /**
   * Returns the scrolling parent of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} scroll parent
   */
  function getScrollParent(element) {
    // Return body, `getScroll` will take care to get the correct `scrollTop` from it
    if (!element) {
      return document.body;
    }

    switch (element.nodeName) {
      case 'HTML':
      case 'BODY':
        return element.ownerDocument.body;
      case '#document':
        return element.body;
    }

    // Firefox want us to check `-x` and `-y` variations as well

    var _getStyleComputedProp = getStyleComputedProperty(element),
        overflow = _getStyleComputedProp.overflow,
        overflowX = _getStyleComputedProp.overflowX,
        overflowY = _getStyleComputedProp.overflowY;

    if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
      return element;
    }

    return getScrollParent(getParentNode(element));
  }

  /**
   * Returns the reference node of the reference object, or the reference object itself.
   * @method
   * @memberof Popper.Utils
   * @param {Element|Object} reference - the reference element (the popper will be relative to this)
   * @returns {Element} parent
   */
  function getReferenceNode(reference) {
    return reference && reference.referenceNode ? reference.referenceNode : reference;
  }

  var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
  var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

  /**
   * Determines if the browser is Internet Explorer
   * @method
   * @memberof Popper.Utils
   * @param {Number} version to check
   * @returns {Boolean} isIE
   */
  function isIE(version) {
    if (version === 11) {
      return isIE11;
    }
    if (version === 10) {
      return isIE10;
    }
    return isIE11 || isIE10;
  }

  /**
   * Returns the offset parent of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} offset parent
   */
  function getOffsetParent(element) {
    if (!element) {
      return document.documentElement;
    }

    var noOffsetParent = isIE(10) ? document.body : null;

    // NOTE: 1 DOM access here
    var offsetParent = element.offsetParent || null;
    // Skip hidden elements which don't have an offsetParent
    while (offsetParent === noOffsetParent && element.nextElementSibling) {
      offsetParent = (element = element.nextElementSibling).offsetParent;
    }

    var nodeName = offsetParent && offsetParent.nodeName;

    if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
      return element ? element.ownerDocument.documentElement : document.documentElement;
    }

    // .offsetParent will return the closest TH, TD or TABLE in case
    // no offsetParent is present, I hate this job...
    if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
      return getOffsetParent(offsetParent);
    }

    return offsetParent;
  }

  function isOffsetContainer(element) {
    var nodeName = element.nodeName;

    if (nodeName === 'BODY') {
      return false;
    }
    return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
  }

  /**
   * Finds the root node (document, shadowDOM root) of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} node
   * @returns {Element} root node
   */
  function getRoot(node) {
    if (node.parentNode !== null) {
      return getRoot(node.parentNode);
    }

    return node;
  }

  /**
   * Finds the offset parent common to the two provided nodes
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element1
   * @argument {Element} element2
   * @returns {Element} common offset parent
   */
  function findCommonOffsetParent(element1, element2) {
    // This check is needed to avoid errors in case one of the elements isn't defined for any reason
    if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
      return document.documentElement;
    }

    // Here we make sure to give as "start" the element that comes first in the DOM
    var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
    var start = order ? element1 : element2;
    var end = order ? element2 : element1;

    // Get common ancestor container
    var range = document.createRange();
    range.setStart(start, 0);
    range.setEnd(end, 0);
    var commonAncestorContainer = range.commonAncestorContainer;

    // Both nodes are inside #document

    if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
      if (isOffsetContainer(commonAncestorContainer)) {
        return commonAncestorContainer;
      }

      return getOffsetParent(commonAncestorContainer);
    }

    // one of the nodes is inside shadowDOM, find which one
    var element1root = getRoot(element1);
    if (element1root.host) {
      return findCommonOffsetParent(element1root.host, element2);
    } else {
      return findCommonOffsetParent(element1, getRoot(element2).host);
    }
  }

  /**
   * Gets the scroll value of the given element in the given side (top and left)
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @argument {String} side `top` or `left`
   * @returns {number} amount of scrolled pixels
   */
  function getScroll(element) {
    var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

    var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
    var nodeName = element.nodeName;

    if (nodeName === 'BODY' || nodeName === 'HTML') {
      var html = element.ownerDocument.documentElement;
      var scrollingElement = element.ownerDocument.scrollingElement || html;
      return scrollingElement[upperSide];
    }

    return element[upperSide];
  }

  /*
   * Sum or subtract the element scroll values (left and top) from a given rect object
   * @method
   * @memberof Popper.Utils
   * @param {Object} rect - Rect object you want to change
   * @param {HTMLElement} element - The element from the function reads the scroll values
   * @param {Boolean} subtract - set to true if you want to subtract the scroll values
   * @return {Object} rect - The modifier rect object
   */
  function includeScroll(rect, element) {
    var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var scrollTop = getScroll(element, 'top');
    var scrollLeft = getScroll(element, 'left');
    var modifier = subtract ? -1 : 1;
    rect.top += scrollTop * modifier;
    rect.bottom += scrollTop * modifier;
    rect.left += scrollLeft * modifier;
    rect.right += scrollLeft * modifier;
    return rect;
  }

  /*
   * Helper to detect borders of a given element
   * @method
   * @memberof Popper.Utils
   * @param {CSSStyleDeclaration} styles
   * Result of `getStyleComputedProperty` on the given element
   * @param {String} axis - `x` or `y`
   * @return {number} borders - The borders size of the given axis
   */

  function getBordersSize(styles, axis) {
    var sideA = axis === 'x' ? 'Left' : 'Top';
    var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

    return parseFloat(styles['border' + sideA + 'Width']) + parseFloat(styles['border' + sideB + 'Width']);
  }

  function getSize(axis, body, html, computedStyle) {
    return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
  }

  function getWindowSizes(document) {
    var body = document.body;
    var html = document.documentElement;
    var computedStyle = isIE(10) && getComputedStyle(html);

    return {
      height: getSize('Height', body, html, computedStyle),
      width: getSize('Width', body, html, computedStyle)
    };
  }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();





  var defineProperty = function (obj, key, value) {
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
  };

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  /**
   * Given element offsets, generate an output similar to getBoundingClientRect
   * @method
   * @memberof Popper.Utils
   * @argument {Object} offsets
   * @returns {Object} ClientRect like output
   */
  function getClientRect(offsets) {
    return _extends({}, offsets, {
      right: offsets.left + offsets.width,
      bottom: offsets.top + offsets.height
    });
  }

  /**
   * Get bounding client rect of given element
   * @method
   * @memberof Popper.Utils
   * @param {HTMLElement} element
   * @return {Object} client rect
   */
  function getBoundingClientRect(element) {
    var rect = {};

    // IE10 10 FIX: Please, don't ask, the element isn't
    // considered in DOM in some circumstances...
    // This isn't reproducible in IE10 compatibility mode of IE11
    try {
      if (isIE(10)) {
        rect = element.getBoundingClientRect();
        var scrollTop = getScroll(element, 'top');
        var scrollLeft = getScroll(element, 'left');
        rect.top += scrollTop;
        rect.left += scrollLeft;
        rect.bottom += scrollTop;
        rect.right += scrollLeft;
      } else {
        rect = element.getBoundingClientRect();
      }
    } catch (e) {}

    var result = {
      left: rect.left,
      top: rect.top,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top
    };

    // subtract scrollbar size from sizes
    var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
    var width = sizes.width || element.clientWidth || result.width;
    var height = sizes.height || element.clientHeight || result.height;

    var horizScrollbar = element.offsetWidth - width;
    var vertScrollbar = element.offsetHeight - height;

    // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
    // we make this check conditional for performance reasons
    if (horizScrollbar || vertScrollbar) {
      var styles = getStyleComputedProperty(element);
      horizScrollbar -= getBordersSize(styles, 'x');
      vertScrollbar -= getBordersSize(styles, 'y');

      result.width -= horizScrollbar;
      result.height -= vertScrollbar;
    }

    return getClientRect(result);
  }

  function getOffsetRectRelativeToArbitraryNode(children, parent) {
    var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var isIE10 = isIE(10);
    var isHTML = parent.nodeName === 'HTML';
    var childrenRect = getBoundingClientRect(children);
    var parentRect = getBoundingClientRect(parent);
    var scrollParent = getScrollParent(children);

    var styles = getStyleComputedProperty(parent);
    var borderTopWidth = parseFloat(styles.borderTopWidth);
    var borderLeftWidth = parseFloat(styles.borderLeftWidth);

    // In cases where the parent is fixed, we must ignore negative scroll in offset calc
    if (fixedPosition && isHTML) {
      parentRect.top = Math.max(parentRect.top, 0);
      parentRect.left = Math.max(parentRect.left, 0);
    }
    var offsets = getClientRect({
      top: childrenRect.top - parentRect.top - borderTopWidth,
      left: childrenRect.left - parentRect.left - borderLeftWidth,
      width: childrenRect.width,
      height: childrenRect.height
    });
    offsets.marginTop = 0;
    offsets.marginLeft = 0;

    // Subtract margins of documentElement in case it's being used as parent
    // we do this only on HTML because it's the only element that behaves
    // differently when margins are applied to it. The margins are included in
    // the box of the documentElement, in the other cases not.
    if (!isIE10 && isHTML) {
      var marginTop = parseFloat(styles.marginTop);
      var marginLeft = parseFloat(styles.marginLeft);

      offsets.top -= borderTopWidth - marginTop;
      offsets.bottom -= borderTopWidth - marginTop;
      offsets.left -= borderLeftWidth - marginLeft;
      offsets.right -= borderLeftWidth - marginLeft;

      // Attach marginTop and marginLeft because in some circumstances we may need them
      offsets.marginTop = marginTop;
      offsets.marginLeft = marginLeft;
    }

    if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
      offsets = includeScroll(offsets, parent);
    }

    return offsets;
  }

  function getViewportOffsetRectRelativeToArtbitraryNode(element) {
    var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var html = element.ownerDocument.documentElement;
    var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
    var width = Math.max(html.clientWidth, window.innerWidth || 0);
    var height = Math.max(html.clientHeight, window.innerHeight || 0);

    var scrollTop = !excludeScroll ? getScroll(html) : 0;
    var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

    var offset = {
      top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
      left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
      width: width,
      height: height
    };

    return getClientRect(offset);
  }

  /**
   * Check if the given element is fixed or is inside a fixed parent
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @argument {Element} customContainer
   * @returns {Boolean} answer to "isFixed?"
   */
  function isFixed(element) {
    var nodeName = element.nodeName;
    if (nodeName === 'BODY' || nodeName === 'HTML') {
      return false;
    }
    if (getStyleComputedProperty(element, 'position') === 'fixed') {
      return true;
    }
    var parentNode = getParentNode(element);
    if (!parentNode) {
      return false;
    }
    return isFixed(parentNode);
  }

  /**
   * Finds the first parent of an element that has a transformed property defined
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} first transformed parent or documentElement
   */

  function getFixedPositionOffsetParent(element) {
    // This check is needed to avoid errors in case one of the elements isn't defined for any reason
    if (!element || !element.parentElement || isIE()) {
      return document.documentElement;
    }
    var el = element.parentElement;
    while (el && getStyleComputedProperty(el, 'transform') === 'none') {
      el = el.parentElement;
    }
    return el || document.documentElement;
  }

  /**
   * Computed the boundaries limits and return them
   * @method
   * @memberof Popper.Utils
   * @param {HTMLElement} popper
   * @param {HTMLElement} reference
   * @param {number} padding
   * @param {HTMLElement} boundariesElement - Element used to define the boundaries
   * @param {Boolean} fixedPosition - Is in fixed position mode
   * @returns {Object} Coordinates of the boundaries
   */
  function getBoundaries(popper, reference, padding, boundariesElement) {
    var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    // NOTE: 1 DOM access here

    var boundaries = { top: 0, left: 0 };
    var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));

    // Handle viewport case
    if (boundariesElement === 'viewport') {
      boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
    } else {
      // Handle other cases based on DOM element used as boundaries
      var boundariesNode = void 0;
      if (boundariesElement === 'scrollParent') {
        boundariesNode = getScrollParent(getParentNode(reference));
        if (boundariesNode.nodeName === 'BODY') {
          boundariesNode = popper.ownerDocument.documentElement;
        }
      } else if (boundariesElement === 'window') {
        boundariesNode = popper.ownerDocument.documentElement;
      } else {
        boundariesNode = boundariesElement;
      }

      var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

      // In case of HTML, we need a different computation
      if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
        var _getWindowSizes = getWindowSizes(popper.ownerDocument),
            height = _getWindowSizes.height,
            width = _getWindowSizes.width;

        boundaries.top += offsets.top - offsets.marginTop;
        boundaries.bottom = height + offsets.top;
        boundaries.left += offsets.left - offsets.marginLeft;
        boundaries.right = width + offsets.left;
      } else {
        // for all the other DOM elements, this one is good
        boundaries = offsets;
      }
    }

    // Add paddings
    padding = padding || 0;
    var isPaddingNumber = typeof padding === 'number';
    boundaries.left += isPaddingNumber ? padding : padding.left || 0;
    boundaries.top += isPaddingNumber ? padding : padding.top || 0;
    boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
    boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

    return boundaries;
  }

  function getArea(_ref) {
    var width = _ref.width,
        height = _ref.height;

    return width * height;
  }

  /**
   * Utility used to transform the `auto` placement to the placement with more
   * available space.
   * @method
   * @memberof Popper.Utils
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
    var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

    if (placement.indexOf('auto') === -1) {
      return placement;
    }

    var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

    var rects = {
      top: {
        width: boundaries.width,
        height: refRect.top - boundaries.top
      },
      right: {
        width: boundaries.right - refRect.right,
        height: boundaries.height
      },
      bottom: {
        width: boundaries.width,
        height: boundaries.bottom - refRect.bottom
      },
      left: {
        width: refRect.left - boundaries.left,
        height: boundaries.height
      }
    };

    var sortedAreas = Object.keys(rects).map(function (key) {
      return _extends({
        key: key
      }, rects[key], {
        area: getArea(rects[key])
      });
    }).sort(function (a, b) {
      return b.area - a.area;
    });

    var filteredAreas = sortedAreas.filter(function (_ref2) {
      var width = _ref2.width,
          height = _ref2.height;
      return width >= popper.clientWidth && height >= popper.clientHeight;
    });

    var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

    var variation = placement.split('-')[1];

    return computedPlacement + (variation ? '-' + variation : '');
  }

  /**
   * Get offsets to the reference element
   * @method
   * @memberof Popper.Utils
   * @param {Object} state
   * @param {Element} popper - the popper element
   * @param {Element} reference - the reference element (the popper will be relative to this)
   * @param {Element} fixedPosition - is in fixed position mode
   * @returns {Object} An object containing the offsets which will be applied to the popper
   */
  function getReferenceOffsets(state, popper, reference) {
    var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));
    return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
  }

  /**
   * Get the outer sizes of the given element (offset size + margins)
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Object} object containing width and height properties
   */
  function getOuterSizes(element) {
    var window = element.ownerDocument.defaultView;
    var styles = window.getComputedStyle(element);
    var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
    var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
    var result = {
      width: element.offsetWidth + y,
      height: element.offsetHeight + x
    };
    return result;
  }

  /**
   * Get the opposite placement of the given one
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement
   * @returns {String} flipped placement
   */
  function getOppositePlacement(placement) {
    var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
    return placement.replace(/left|right|bottom|top/g, function (matched) {
      return hash[matched];
    });
  }

  /**
   * Get offsets to the popper
   * @method
   * @memberof Popper.Utils
   * @param {Object} position - CSS position the Popper will get applied
   * @param {HTMLElement} popper - the popper element
   * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
   * @param {String} placement - one of the valid placement options
   * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
   */
  function getPopperOffsets(popper, referenceOffsets, placement) {
    placement = placement.split('-')[0];

    // Get popper node sizes
    var popperRect = getOuterSizes(popper);

    // Add position, width and height to our offsets object
    var popperOffsets = {
      width: popperRect.width,
      height: popperRect.height
    };

    // depending by the popper placement we have to compute its offsets slightly differently
    var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
    var mainSide = isHoriz ? 'top' : 'left';
    var secondarySide = isHoriz ? 'left' : 'top';
    var measurement = isHoriz ? 'height' : 'width';
    var secondaryMeasurement = !isHoriz ? 'height' : 'width';

    popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
    if (placement === secondarySide) {
      popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
    } else {
      popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
    }

    return popperOffsets;
  }

  /**
   * Mimics the `find` method of Array
   * @method
   * @memberof Popper.Utils
   * @argument {Array} arr
   * @argument prop
   * @argument value
   * @returns index or -1
   */
  function find(arr, check) {
    // use native find if supported
    if (Array.prototype.find) {
      return arr.find(check);
    }

    // use `filter` to obtain the same behavior of `find`
    return arr.filter(check)[0];
  }

  /**
   * Return the index of the matching object
   * @method
   * @memberof Popper.Utils
   * @argument {Array} arr
   * @argument prop
   * @argument value
   * @returns index or -1
   */
  function findIndex(arr, prop, value) {
    // use native findIndex if supported
    if (Array.prototype.findIndex) {
      return arr.findIndex(function (cur) {
        return cur[prop] === value;
      });
    }

    // use `find` + `indexOf` if `findIndex` isn't supported
    var match = find(arr, function (obj) {
      return obj[prop] === value;
    });
    return arr.indexOf(match);
  }

  /**
   * Loop trough the list of modifiers and run them in order,
   * each of them will then edit the data object.
   * @method
   * @memberof Popper.Utils
   * @param {dataObject} data
   * @param {Array} modifiers
   * @param {String} ends - Optional modifier name used as stopper
   * @returns {dataObject}
   */
  function runModifiers(modifiers, data, ends) {
    var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

    modifiersToRun.forEach(function (modifier) {
      if (modifier['function']) {
        // eslint-disable-line dot-notation
        console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
      }
      var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
      if (modifier.enabled && isFunction(fn)) {
        // Add properties to offsets to make them a complete clientRect object
        // we do this before each modifier to make sure the previous one doesn't
        // mess with these values
        data.offsets.popper = getClientRect(data.offsets.popper);
        data.offsets.reference = getClientRect(data.offsets.reference);

        data = fn(data, modifier);
      }
    });

    return data;
  }

  /**
   * Updates the position of the popper, computing the new offsets and applying
   * the new style.<br />
   * Prefer `scheduleUpdate` over `update` because of performance reasons.
   * @method
   * @memberof Popper
   */
  function update() {
    // if popper is destroyed, don't perform any further update
    if (this.state.isDestroyed) {
      return;
    }

    var data = {
      instance: this,
      styles: {},
      arrowStyles: {},
      attributes: {},
      flipped: false,
      offsets: {}
    };

    // compute reference element offsets
    data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

    // compute auto placement, store placement inside the data object,
    // modifiers will be able to edit `placement` if needed
    // and refer to originalPlacement to know the original value
    data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

    // store the computed placement inside `originalPlacement`
    data.originalPlacement = data.placement;

    data.positionFixed = this.options.positionFixed;

    // compute the popper offsets
    data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

    data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

    // run the modifiers
    data = runModifiers(this.modifiers, data);

    // the first `update` will call `onCreate` callback
    // the other ones will call `onUpdate` callback
    if (!this.state.isCreated) {
      this.state.isCreated = true;
      this.options.onCreate(data);
    } else {
      this.options.onUpdate(data);
    }
  }

  /**
   * Helper used to know if the given modifier is enabled.
   * @method
   * @memberof Popper.Utils
   * @returns {Boolean}
   */
  function isModifierEnabled(modifiers, modifierName) {
    return modifiers.some(function (_ref) {
      var name = _ref.name,
          enabled = _ref.enabled;
      return enabled && name === modifierName;
    });
  }

  /**
   * Get the prefixed supported property name
   * @method
   * @memberof Popper.Utils
   * @argument {String} property (camelCase)
   * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
   */
  function getSupportedPropertyName(property) {
    var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
    var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

    for (var i = 0; i < prefixes.length; i++) {
      var prefix = prefixes[i];
      var toCheck = prefix ? '' + prefix + upperProp : property;
      if (typeof document.body.style[toCheck] !== 'undefined') {
        return toCheck;
      }
    }
    return null;
  }

  /**
   * Destroys the popper.
   * @method
   * @memberof Popper
   */
  function destroy() {
    this.state.isDestroyed = true;

    // touch DOM only if `applyStyle` modifier is enabled
    if (isModifierEnabled(this.modifiers, 'applyStyle')) {
      this.popper.removeAttribute('x-placement');
      this.popper.style.position = '';
      this.popper.style.top = '';
      this.popper.style.left = '';
      this.popper.style.right = '';
      this.popper.style.bottom = '';
      this.popper.style.willChange = '';
      this.popper.style[getSupportedPropertyName('transform')] = '';
    }

    this.disableEventListeners();

    // remove the popper if user explicitly asked for the deletion on destroy
    // do not use `remove` because IE11 doesn't support it
    if (this.options.removeOnDestroy) {
      this.popper.parentNode.removeChild(this.popper);
    }
    return this;
  }

  /**
   * Get the window associated with the element
   * @argument {Element} element
   * @returns {Window}
   */
  function getWindow(element) {
    var ownerDocument = element.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView : window;
  }

  function attachToScrollParents(scrollParent, event, callback, scrollParents) {
    var isBody = scrollParent.nodeName === 'BODY';
    var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
    target.addEventListener(event, callback, { passive: true });

    if (!isBody) {
      attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
    }
    scrollParents.push(target);
  }

  /**
   * Setup needed event listeners used to update the popper position
   * @method
   * @memberof Popper.Utils
   * @private
   */
  function setupEventListeners(reference, options, state, updateBound) {
    // Resize event listener on window
    state.updateBound = updateBound;
    getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

    // Scroll event listener on scroll parents
    var scrollElement = getScrollParent(reference);
    attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
    state.scrollElement = scrollElement;
    state.eventsEnabled = true;

    return state;
  }

  /**
   * It will add resize/scroll events and start recalculating
   * position of the popper element when they are triggered.
   * @method
   * @memberof Popper
   */
  function enableEventListeners() {
    if (!this.state.eventsEnabled) {
      this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
    }
  }

  /**
   * Remove event listeners used to update the popper position
   * @method
   * @memberof Popper.Utils
   * @private
   */
  function removeEventListeners(reference, state) {
    // Remove resize event listener on window
    getWindow(reference).removeEventListener('resize', state.updateBound);

    // Remove scroll event listener on scroll parents
    state.scrollParents.forEach(function (target) {
      target.removeEventListener('scroll', state.updateBound);
    });

    // Reset state
    state.updateBound = null;
    state.scrollParents = [];
    state.scrollElement = null;
    state.eventsEnabled = false;
    return state;
  }

  /**
   * It will remove resize/scroll events and won't recalculate popper position
   * when they are triggered. It also won't trigger `onUpdate` callback anymore,
   * unless you call `update` method manually.
   * @method
   * @memberof Popper
   */
  function disableEventListeners() {
    if (this.state.eventsEnabled) {
      cancelAnimationFrame(this.scheduleUpdate);
      this.state = removeEventListeners(this.reference, this.state);
    }
  }

  /**
   * Tells if a given input is a number
   * @method
   * @memberof Popper.Utils
   * @param {*} input to check
   * @return {Boolean}
   */
  function isNumeric(n) {
    return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
  }

  /**
   * Set the style to the given popper
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element - Element to apply the style to
   * @argument {Object} styles
   * Object with a list of properties and values which will be applied to the element
   */
  function setStyles(element, styles) {
    Object.keys(styles).forEach(function (prop) {
      var unit = '';
      // add unit if the value is numeric and is one of the following
      if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
        unit = 'px';
      }
      element.style[prop] = styles[prop] + unit;
    });
  }

  /**
   * Set the attributes to the given popper
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element - Element to apply the attributes to
   * @argument {Object} styles
   * Object with a list of properties and values which will be applied to the element
   */
  function setAttributes(element, attributes) {
    Object.keys(attributes).forEach(function (prop) {
      var value = attributes[prop];
      if (value !== false) {
        element.setAttribute(prop, attributes[prop]);
      } else {
        element.removeAttribute(prop);
      }
    });
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} data.styles - List of style properties - values to apply to popper element
   * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The same data object
   */
  function applyStyle(data) {
    // any property present in `data.styles` will be applied to the popper,
    // in this way we can make the 3rd party modifiers add custom styles to it
    // Be aware, modifiers could override the properties defined in the previous
    // lines of this modifier!
    setStyles(data.instance.popper, data.styles);

    // any property present in `data.attributes` will be applied to the popper,
    // they will be set as HTML attributes of the element
    setAttributes(data.instance.popper, data.attributes);

    // if arrowElement is defined and arrowStyles has some properties
    if (data.arrowElement && Object.keys(data.arrowStyles).length) {
      setStyles(data.arrowElement, data.arrowStyles);
    }

    return data;
  }

  /**
   * Set the x-placement attribute before everything else because it could be used
   * to add margins to the popper margins needs to be calculated to get the
   * correct popper offsets.
   * @method
   * @memberof Popper.modifiers
   * @param {HTMLElement} reference - The reference element used to position the popper
   * @param {HTMLElement} popper - The HTML element used as popper
   * @param {Object} options - Popper.js options
   */
  function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
    // compute reference element offsets
    var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

    // compute auto placement, store placement inside the data object,
    // modifiers will be able to edit `placement` if needed
    // and refer to originalPlacement to know the original value
    var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

    popper.setAttribute('x-placement', placement);

    // Apply `position` to popper before anything else because
    // without the position applied we can't guarantee correct computations
    setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

    return options;
  }

  /**
   * @function
   * @memberof Popper.Utils
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Boolean} shouldRound - If the offsets should be rounded at all
   * @returns {Object} The popper's position offsets rounded
   *
   * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
   * good as it can be within reason.
   * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
   *
   * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
   * as well on High DPI screens).
   *
   * Firefox prefers no rounding for positioning and does not have blurriness on
   * high DPI screens.
   *
   * Only horizontal placement and left/right values need to be considered.
   */
  function getRoundedOffsets(data, shouldRound) {
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;
    var round = Math.round,
        floor = Math.floor;

    var noRound = function noRound(v) {
      return v;
    };

    var referenceWidth = round(reference.width);
    var popperWidth = round(popper.width);

    var isVertical = ['left', 'right'].indexOf(data.placement) !== -1;
    var isVariation = data.placement.indexOf('-') !== -1;
    var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
    var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

    var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
    var verticalToInteger = !shouldRound ? noRound : round;

    return {
      left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper.left - 1 : popper.left),
      top: verticalToInteger(popper.top),
      bottom: verticalToInteger(popper.bottom),
      right: horizontalToInteger(popper.right)
    };
  }

  var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function computeStyle(data, options) {
    var x = options.x,
        y = options.y;
    var popper = data.offsets.popper;

    // Remove this legacy support in Popper.js v2

    var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
      return modifier.name === 'applyStyle';
    }).gpuAcceleration;
    if (legacyGpuAccelerationOption !== undefined) {
      console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
    }
    var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

    var offsetParent = getOffsetParent(data.instance.popper);
    var offsetParentRect = getBoundingClientRect(offsetParent);

    // Styles
    var styles = {
      position: popper.position
    };

    var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);

    var sideA = x === 'bottom' ? 'top' : 'bottom';
    var sideB = y === 'right' ? 'left' : 'right';

    // if gpuAcceleration is set to `true` and transform is supported,
    //  we use `translate3d` to apply the position to the popper we
    // automatically use the supported prefixed version if needed
    var prefixedProperty = getSupportedPropertyName('transform');

    // now, let's make a step back and look at this code closely (wtf?)
    // If the content of the popper grows once it's been positioned, it
    // may happen that the popper gets misplaced because of the new content
    // overflowing its reference element
    // To avoid this problem, we provide two options (x and y), which allow
    // the consumer to define the offset origin.
    // If we position a popper on top of a reference element, we can set
    // `x` to `top` to make the popper grow towards its top instead of
    // its bottom.
    var left = void 0,
        top = void 0;
    if (sideA === 'bottom') {
      // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
      // and not the bottom of the html element
      if (offsetParent.nodeName === 'HTML') {
        top = -offsetParent.clientHeight + offsets.bottom;
      } else {
        top = -offsetParentRect.height + offsets.bottom;
      }
    } else {
      top = offsets.top;
    }
    if (sideB === 'right') {
      if (offsetParent.nodeName === 'HTML') {
        left = -offsetParent.clientWidth + offsets.right;
      } else {
        left = -offsetParentRect.width + offsets.right;
      }
    } else {
      left = offsets.left;
    }
    if (gpuAcceleration && prefixedProperty) {
      styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
      styles[sideA] = 0;
      styles[sideB] = 0;
      styles.willChange = 'transform';
    } else {
      // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
      var invertTop = sideA === 'bottom' ? -1 : 1;
      var invertLeft = sideB === 'right' ? -1 : 1;
      styles[sideA] = top * invertTop;
      styles[sideB] = left * invertLeft;
      styles.willChange = sideA + ', ' + sideB;
    }

    // Attributes
    var attributes = {
      'x-placement': data.placement
    };

    // Update `data` attributes, styles and arrowStyles
    data.attributes = _extends({}, attributes, data.attributes);
    data.styles = _extends({}, styles, data.styles);
    data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

    return data;
  }

  /**
   * Helper used to know if the given modifier depends from another one.<br />
   * It checks if the needed modifier is listed and enabled.
   * @method
   * @memberof Popper.Utils
   * @param {Array} modifiers - list of modifiers
   * @param {String} requestingName - name of requesting modifier
   * @param {String} requestedName - name of requested modifier
   * @returns {Boolean}
   */
  function isModifierRequired(modifiers, requestingName, requestedName) {
    var requesting = find(modifiers, function (_ref) {
      var name = _ref.name;
      return name === requestingName;
    });

    var isRequired = !!requesting && modifiers.some(function (modifier) {
      return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
    });

    if (!isRequired) {
      var _requesting = '`' + requestingName + '`';
      var requested = '`' + requestedName + '`';
      console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
    }
    return isRequired;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function arrow(data, options) {
    var _data$offsets$arrow;

    // arrow depends on keepTogether in order to work
    if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
      return data;
    }

    var arrowElement = options.element;

    // if arrowElement is a string, suppose it's a CSS selector
    if (typeof arrowElement === 'string') {
      arrowElement = data.instance.popper.querySelector(arrowElement);

      // if arrowElement is not found, don't run the modifier
      if (!arrowElement) {
        return data;
      }
    } else {
      // if the arrowElement isn't a query selector we must check that the
      // provided DOM node is child of its popper node
      if (!data.instance.popper.contains(arrowElement)) {
        console.warn('WARNING: `arrow.element` must be child of its popper element!');
        return data;
      }
    }

    var placement = data.placement.split('-')[0];
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var isVertical = ['left', 'right'].indexOf(placement) !== -1;

    var len = isVertical ? 'height' : 'width';
    var sideCapitalized = isVertical ? 'Top' : 'Left';
    var side = sideCapitalized.toLowerCase();
    var altSide = isVertical ? 'left' : 'top';
    var opSide = isVertical ? 'bottom' : 'right';
    var arrowElementSize = getOuterSizes(arrowElement)[len];

    //
    // extends keepTogether behavior making sure the popper and its
    // reference have enough pixels in conjunction
    //

    // top/left side
    if (reference[opSide] - arrowElementSize < popper[side]) {
      data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
    }
    // bottom/right side
    if (reference[side] + arrowElementSize > popper[opSide]) {
      data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
    }
    data.offsets.popper = getClientRect(data.offsets.popper);

    // compute center of the popper
    var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

    // Compute the sideValue using the updated popper offsets
    // take popper margin in account because we don't have this info available
    var css = getStyleComputedProperty(data.instance.popper);
    var popperMarginSide = parseFloat(css['margin' + sideCapitalized]);
    var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width']);
    var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

    // prevent arrowElement from being placed not contiguously to its popper
    sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

    data.arrowElement = arrowElement;
    data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

    return data;
  }

  /**
   * Get the opposite placement variation of the given one
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement variation
   * @returns {String} flipped placement variation
   */
  function getOppositeVariation(variation) {
    if (variation === 'end') {
      return 'start';
    } else if (variation === 'start') {
      return 'end';
    }
    return variation;
  }

  /**
   * List of accepted placements to use as values of the `placement` option.<br />
   * Valid placements are:
   * - `auto`
   * - `top`
   * - `right`
   * - `bottom`
   * - `left`
   *
   * Each placement can have a variation from this list:
   * - `-start`
   * - `-end`
   *
   * Variations are interpreted easily if you think of them as the left to right
   * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
   * is right.<br />
   * Vertically (`left` and `right`), `start` is top and `end` is bottom.
   *
   * Some valid examples are:
   * - `top-end` (on top of reference, right aligned)
   * - `right-start` (on right of reference, top aligned)
   * - `bottom` (on bottom, centered)
   * - `auto-end` (on the side with more space available, alignment depends by placement)
   *
   * @static
   * @type {Array}
   * @enum {String}
   * @readonly
   * @method placements
   * @memberof Popper
   */
  var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

  // Get rid of `auto` `auto-start` and `auto-end`
  var validPlacements = placements.slice(3);

  /**
   * Given an initial placement, returns all the subsequent placements
   * clockwise (or counter-clockwise).
   *
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement - A valid placement (it accepts variations)
   * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
   * @returns {Array} placements including their variations
   */
  function clockwise(placement) {
    var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var index = validPlacements.indexOf(placement);
    var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
    return counter ? arr.reverse() : arr;
  }

  var BEHAVIORS = {
    FLIP: 'flip',
    CLOCKWISE: 'clockwise',
    COUNTERCLOCKWISE: 'counterclockwise'
  };

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function flip(data, options) {
    // if `inner` modifier is enabled, we can't use the `flip` modifier
    if (isModifierEnabled(data.instance.modifiers, 'inner')) {
      return data;
    }

    if (data.flipped && data.placement === data.originalPlacement) {
      // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
      return data;
    }

    var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

    var placement = data.placement.split('-')[0];
    var placementOpposite = getOppositePlacement(placement);
    var variation = data.placement.split('-')[1] || '';

    var flipOrder = [];

    switch (options.behavior) {
      case BEHAVIORS.FLIP:
        flipOrder = [placement, placementOpposite];
        break;
      case BEHAVIORS.CLOCKWISE:
        flipOrder = clockwise(placement);
        break;
      case BEHAVIORS.COUNTERCLOCKWISE:
        flipOrder = clockwise(placement, true);
        break;
      default:
        flipOrder = options.behavior;
    }

    flipOrder.forEach(function (step, index) {
      if (placement !== step || flipOrder.length === index + 1) {
        return data;
      }

      placement = data.placement.split('-')[0];
      placementOpposite = getOppositePlacement(placement);

      var popperOffsets = data.offsets.popper;
      var refOffsets = data.offsets.reference;

      // using floor because the reference offsets may contain decimals we are not going to consider here
      var floor = Math.floor;
      var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

      var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
      var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
      var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
      var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

      var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

      // flip the variation if required
      var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;

      // flips variation if reference element overflows boundaries
      var flippedVariationByRef = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

      // flips variation if popper content overflows boundaries
      var flippedVariationByContent = !!options.flipVariationsByContent && (isVertical && variation === 'start' && overflowsRight || isVertical && variation === 'end' && overflowsLeft || !isVertical && variation === 'start' && overflowsBottom || !isVertical && variation === 'end' && overflowsTop);

      var flippedVariation = flippedVariationByRef || flippedVariationByContent;

      if (overlapsRef || overflowsBoundaries || flippedVariation) {
        // this boolean to detect any flip loop
        data.flipped = true;

        if (overlapsRef || overflowsBoundaries) {
          placement = flipOrder[index + 1];
        }

        if (flippedVariation) {
          variation = getOppositeVariation(variation);
        }

        data.placement = placement + (variation ? '-' + variation : '');

        // this object contains `position`, we want to preserve it along with
        // any additional property we may add in the future
        data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

        data = runModifiers(data.instance.modifiers, data, 'flip');
      }
    });
    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function keepTogether(data) {
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var placement = data.placement.split('-')[0];
    var floor = Math.floor;
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
    var side = isVertical ? 'right' : 'bottom';
    var opSide = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    if (popper[side] < floor(reference[opSide])) {
      data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
    }
    if (popper[opSide] > floor(reference[side])) {
      data.offsets.popper[opSide] = floor(reference[side]);
    }

    return data;
  }

  /**
   * Converts a string containing value + unit into a px value number
   * @function
   * @memberof {modifiers~offset}
   * @private
   * @argument {String} str - Value + unit string
   * @argument {String} measurement - `height` or `width`
   * @argument {Object} popperOffsets
   * @argument {Object} referenceOffsets
   * @returns {Number|String}
   * Value in pixels, or original string if no values were extracted
   */
  function toValue(str, measurement, popperOffsets, referenceOffsets) {
    // separate value from unit
    var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
    var value = +split[1];
    var unit = split[2];

    // If it's not a number it's an operator, I guess
    if (!value) {
      return str;
    }

    if (unit.indexOf('%') === 0) {
      var element = void 0;
      switch (unit) {
        case '%p':
          element = popperOffsets;
          break;
        case '%':
        case '%r':
        default:
          element = referenceOffsets;
      }

      var rect = getClientRect(element);
      return rect[measurement] / 100 * value;
    } else if (unit === 'vh' || unit === 'vw') {
      // if is a vh or vw, we calculate the size based on the viewport
      var size = void 0;
      if (unit === 'vh') {
        size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      } else {
        size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      }
      return size / 100 * value;
    } else {
      // if is an explicit pixel unit, we get rid of the unit and keep the value
      // if is an implicit unit, it's px, and we return just the value
      return value;
    }
  }

  /**
   * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
   * @function
   * @memberof {modifiers~offset}
   * @private
   * @argument {String} offset
   * @argument {Object} popperOffsets
   * @argument {Object} referenceOffsets
   * @argument {String} basePlacement
   * @returns {Array} a two cells array with x and y offsets in numbers
   */
  function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
    var offsets = [0, 0];

    // Use height if placement is left or right and index is 0 otherwise use width
    // in this way the first offset will use an axis and the second one
    // will use the other one
    var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

    // Split the offset string to obtain a list of values and operands
    // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
    var fragments = offset.split(/(\+|\-)/).map(function (frag) {
      return frag.trim();
    });

    // Detect if the offset string contains a pair of values or a single one
    // they could be separated by comma or space
    var divider = fragments.indexOf(find(fragments, function (frag) {
      return frag.search(/,|\s/) !== -1;
    }));

    if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
      console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
    }

    // If divider is found, we divide the list of values and operands to divide
    // them by ofset X and Y.
    var splitRegex = /\s*,\s*|\s+/;
    var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

    // Convert the values with units to absolute pixels to allow our computations
    ops = ops.map(function (op, index) {
      // Most of the units rely on the orientation of the popper
      var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
      var mergeWithPrevious = false;
      return op
      // This aggregates any `+` or `-` sign that aren't considered operators
      // e.g.: 10 + +5 => [10, +, +5]
      .reduce(function (a, b) {
        if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
          a[a.length - 1] = b;
          mergeWithPrevious = true;
          return a;
        } else if (mergeWithPrevious) {
          a[a.length - 1] += b;
          mergeWithPrevious = false;
          return a;
        } else {
          return a.concat(b);
        }
      }, [])
      // Here we convert the string values into number values (in px)
      .map(function (str) {
        return toValue(str, measurement, popperOffsets, referenceOffsets);
      });
    });

    // Loop trough the offsets arrays and execute the operations
    ops.forEach(function (op, index) {
      op.forEach(function (frag, index2) {
        if (isNumeric(frag)) {
          offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
        }
      });
    });
    return offsets;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @argument {Number|String} options.offset=0
   * The offset value as described in the modifier description
   * @returns {Object} The data object, properly modified
   */
  function offset(data, _ref) {
    var offset = _ref.offset;
    var placement = data.placement,
        _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var basePlacement = placement.split('-')[0];

    var offsets = void 0;
    if (isNumeric(+offset)) {
      offsets = [+offset, 0];
    } else {
      offsets = parseOffset(offset, popper, reference, basePlacement);
    }

    if (basePlacement === 'left') {
      popper.top += offsets[0];
      popper.left -= offsets[1];
    } else if (basePlacement === 'right') {
      popper.top += offsets[0];
      popper.left += offsets[1];
    } else if (basePlacement === 'top') {
      popper.left += offsets[0];
      popper.top -= offsets[1];
    } else if (basePlacement === 'bottom') {
      popper.left += offsets[0];
      popper.top += offsets[1];
    }

    data.popper = popper;
    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function preventOverflow(data, options) {
    var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

    // If offsetParent is the reference element, we really want to
    // go one step up and use the next offsetParent as reference to
    // avoid to make this modifier completely useless and look like broken
    if (data.instance.reference === boundariesElement) {
      boundariesElement = getOffsetParent(boundariesElement);
    }

    // NOTE: DOM access here
    // resets the popper's position so that the document size can be calculated excluding
    // the size of the popper element itself
    var transformProp = getSupportedPropertyName('transform');
    var popperStyles = data.instance.popper.style; // assignment to help minification
    var top = popperStyles.top,
        left = popperStyles.left,
        transform = popperStyles[transformProp];

    popperStyles.top = '';
    popperStyles.left = '';
    popperStyles[transformProp] = '';

    var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

    // NOTE: DOM access here
    // restores the original style properties after the offsets have been computed
    popperStyles.top = top;
    popperStyles.left = left;
    popperStyles[transformProp] = transform;

    options.boundaries = boundaries;

    var order = options.priority;
    var popper = data.offsets.popper;

    var check = {
      primary: function primary(placement) {
        var value = popper[placement];
        if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
          value = Math.max(popper[placement], boundaries[placement]);
        }
        return defineProperty({}, placement, value);
      },
      secondary: function secondary(placement) {
        var mainSide = placement === 'right' ? 'left' : 'top';
        var value = popper[mainSide];
        if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
          value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
        }
        return defineProperty({}, mainSide, value);
      }
    };

    order.forEach(function (placement) {
      var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
      popper = _extends({}, popper, check[side](placement));
    });

    data.offsets.popper = popper;

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function shift(data) {
    var placement = data.placement;
    var basePlacement = placement.split('-')[0];
    var shiftvariation = placement.split('-')[1];

    // if shift shiftvariation is specified, run the modifier
    if (shiftvariation) {
      var _data$offsets = data.offsets,
          reference = _data$offsets.reference,
          popper = _data$offsets.popper;

      var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
      var side = isVertical ? 'left' : 'top';
      var measurement = isVertical ? 'width' : 'height';

      var shiftOffsets = {
        start: defineProperty({}, side, reference[side]),
        end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
      };

      data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
    }

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function hide(data) {
    if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
      return data;
    }

    var refRect = data.offsets.reference;
    var bound = find(data.instance.modifiers, function (modifier) {
      return modifier.name === 'preventOverflow';
    }).boundaries;

    if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
      // Avoid unnecessary DOM access if visibility hasn't changed
      if (data.hide === true) {
        return data;
      }

      data.hide = true;
      data.attributes['x-out-of-boundaries'] = '';
    } else {
      // Avoid unnecessary DOM access if visibility hasn't changed
      if (data.hide === false) {
        return data;
      }

      data.hide = false;
      data.attributes['x-out-of-boundaries'] = false;
    }

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function inner(data) {
    var placement = data.placement;
    var basePlacement = placement.split('-')[0];
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

    var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

    popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

    data.placement = getOppositePlacement(placement);
    data.offsets.popper = getClientRect(popper);

    return data;
  }

  /**
   * Modifier function, each modifier can have a function of this type assigned
   * to its `fn` property.<br />
   * These functions will be called on each update, this means that you must
   * make sure they are performant enough to avoid performance bottlenecks.
   *
   * @function ModifierFn
   * @argument {dataObject} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {dataObject} The data object, properly modified
   */

  /**
   * Modifiers are plugins used to alter the behavior of your poppers.<br />
   * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
   * needed by the library.
   *
   * Usually you don't want to override the `order`, `fn` and `onLoad` props.
   * All the other properties are configurations that could be tweaked.
   * @namespace modifiers
   */
  var modifiers = {
    /**
     * Modifier used to shift the popper on the start or end of its reference
     * element.<br />
     * It will read the variation of the `placement` property.<br />
     * It can be one either `-end` or `-start`.
     * @memberof modifiers
     * @inner
     */
    shift: {
      /** @prop {number} order=100 - Index used to define the order of execution */
      order: 100,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: shift
    },

    /**
     * The `offset` modifier can shift your popper on both its axis.
     *
     * It accepts the following units:
     * - `px` or unit-less, interpreted as pixels
     * - `%` or `%r`, percentage relative to the length of the reference element
     * - `%p`, percentage relative to the length of the popper element
     * - `vw`, CSS viewport width unit
     * - `vh`, CSS viewport height unit
     *
     * For length is intended the main axis relative to the placement of the popper.<br />
     * This means that if the placement is `top` or `bottom`, the length will be the
     * `width`. In case of `left` or `right`, it will be the `height`.
     *
     * You can provide a single value (as `Number` or `String`), or a pair of values
     * as `String` divided by a comma or one (or more) white spaces.<br />
     * The latter is a deprecated method because it leads to confusion and will be
     * removed in v2.<br />
     * Additionally, it accepts additions and subtractions between different units.
     * Note that multiplications and divisions aren't supported.
     *
     * Valid examples are:
     * ```
     * 10
     * '10%'
     * '10, 10'
     * '10%, 10'
     * '10 + 10%'
     * '10 - 5vh + 3%'
     * '-10px + 5vh, 5px - 6%'
     * ```
     * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
     * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
     * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
     *
     * @memberof modifiers
     * @inner
     */
    offset: {
      /** @prop {number} order=200 - Index used to define the order of execution */
      order: 200,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: offset,
      /** @prop {Number|String} offset=0
       * The offset value as described in the modifier description
       */
      offset: 0
    },

    /**
     * Modifier used to prevent the popper from being positioned outside the boundary.
     *
     * A scenario exists where the reference itself is not within the boundaries.<br />
     * We can say it has "escaped the boundaries" — or just "escaped".<br />
     * In this case we need to decide whether the popper should either:
     *
     * - detach from the reference and remain "trapped" in the boundaries, or
     * - if it should ignore the boundary and "escape with its reference"
     *
     * When `escapeWithReference` is set to`true` and reference is completely
     * outside its boundaries, the popper will overflow (or completely leave)
     * the boundaries in order to remain attached to the edge of the reference.
     *
     * @memberof modifiers
     * @inner
     */
    preventOverflow: {
      /** @prop {number} order=300 - Index used to define the order of execution */
      order: 300,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: preventOverflow,
      /**
       * @prop {Array} [priority=['left','right','top','bottom']]
       * Popper will try to prevent overflow following these priorities by default,
       * then, it could overflow on the left and on top of the `boundariesElement`
       */
      priority: ['left', 'right', 'top', 'bottom'],
      /**
       * @prop {number} padding=5
       * Amount of pixel used to define a minimum distance between the boundaries
       * and the popper. This makes sure the popper always has a little padding
       * between the edges of its container
       */
      padding: 5,
      /**
       * @prop {String|HTMLElement} boundariesElement='scrollParent'
       * Boundaries used by the modifier. Can be `scrollParent`, `window`,
       * `viewport` or any DOM element.
       */
      boundariesElement: 'scrollParent'
    },

    /**
     * Modifier used to make sure the reference and its popper stay near each other
     * without leaving any gap between the two. Especially useful when the arrow is
     * enabled and you want to ensure that it points to its reference element.
     * It cares only about the first axis. You can still have poppers with margin
     * between the popper and its reference element.
     * @memberof modifiers
     * @inner
     */
    keepTogether: {
      /** @prop {number} order=400 - Index used to define the order of execution */
      order: 400,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: keepTogether
    },

    /**
     * This modifier is used to move the `arrowElement` of the popper to make
     * sure it is positioned between the reference element and its popper element.
     * It will read the outer size of the `arrowElement` node to detect how many
     * pixels of conjunction are needed.
     *
     * It has no effect if no `arrowElement` is provided.
     * @memberof modifiers
     * @inner
     */
    arrow: {
      /** @prop {number} order=500 - Index used to define the order of execution */
      order: 500,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: arrow,
      /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
      element: '[x-arrow]'
    },

    /**
     * Modifier used to flip the popper's placement when it starts to overlap its
     * reference element.
     *
     * Requires the `preventOverflow` modifier before it in order to work.
     *
     * **NOTE:** this modifier will interrupt the current update cycle and will
     * restart it if it detects the need to flip the placement.
     * @memberof modifiers
     * @inner
     */
    flip: {
      /** @prop {number} order=600 - Index used to define the order of execution */
      order: 600,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: flip,
      /**
       * @prop {String|Array} behavior='flip'
       * The behavior used to change the popper's placement. It can be one of
       * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
       * placements (with optional variations)
       */
      behavior: 'flip',
      /**
       * @prop {number} padding=5
       * The popper will flip if it hits the edges of the `boundariesElement`
       */
      padding: 5,
      /**
       * @prop {String|HTMLElement} boundariesElement='viewport'
       * The element which will define the boundaries of the popper position.
       * The popper will never be placed outside of the defined boundaries
       * (except if `keepTogether` is enabled)
       */
      boundariesElement: 'viewport',
      /**
       * @prop {Boolean} flipVariations=false
       * The popper will switch placement variation between `-start` and `-end` when
       * the reference element overlaps its boundaries.
       *
       * The original placement should have a set variation.
       */
      flipVariations: false,
      /**
       * @prop {Boolean} flipVariationsByContent=false
       * The popper will switch placement variation between `-start` and `-end` when
       * the popper element overlaps its reference boundaries.
       *
       * The original placement should have a set variation.
       */
      flipVariationsByContent: false
    },

    /**
     * Modifier used to make the popper flow toward the inner of the reference element.
     * By default, when this modifier is disabled, the popper will be placed outside
     * the reference element.
     * @memberof modifiers
     * @inner
     */
    inner: {
      /** @prop {number} order=700 - Index used to define the order of execution */
      order: 700,
      /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
      enabled: false,
      /** @prop {ModifierFn} */
      fn: inner
    },

    /**
     * Modifier used to hide the popper when its reference element is outside of the
     * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
     * be used to hide with a CSS selector the popper when its reference is
     * out of boundaries.
     *
     * Requires the `preventOverflow` modifier before it in order to work.
     * @memberof modifiers
     * @inner
     */
    hide: {
      /** @prop {number} order=800 - Index used to define the order of execution */
      order: 800,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: hide
    },

    /**
     * Computes the style that will be applied to the popper element to gets
     * properly positioned.
     *
     * Note that this modifier will not touch the DOM, it just prepares the styles
     * so that `applyStyle` modifier can apply it. This separation is useful
     * in case you need to replace `applyStyle` with a custom implementation.
     *
     * This modifier has `850` as `order` value to maintain backward compatibility
     * with previous versions of Popper.js. Expect the modifiers ordering method
     * to change in future major versions of the library.
     *
     * @memberof modifiers
     * @inner
     */
    computeStyle: {
      /** @prop {number} order=850 - Index used to define the order of execution */
      order: 850,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: computeStyle,
      /**
       * @prop {Boolean} gpuAcceleration=true
       * If true, it uses the CSS 3D transformation to position the popper.
       * Otherwise, it will use the `top` and `left` properties
       */
      gpuAcceleration: true,
      /**
       * @prop {string} [x='bottom']
       * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
       * Change this if your popper should grow in a direction different from `bottom`
       */
      x: 'bottom',
      /**
       * @prop {string} [x='left']
       * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
       * Change this if your popper should grow in a direction different from `right`
       */
      y: 'right'
    },

    /**
     * Applies the computed styles to the popper element.
     *
     * All the DOM manipulations are limited to this modifier. This is useful in case
     * you want to integrate Popper.js inside a framework or view library and you
     * want to delegate all the DOM manipulations to it.
     *
     * Note that if you disable this modifier, you must make sure the popper element
     * has its position set to `absolute` before Popper.js can do its work!
     *
     * Just disable this modifier and define your own to achieve the desired effect.
     *
     * @memberof modifiers
     * @inner
     */
    applyStyle: {
      /** @prop {number} order=900 - Index used to define the order of execution */
      order: 900,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: applyStyle,
      /** @prop {Function} */
      onLoad: applyStyleOnLoad,
      /**
       * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
       * @prop {Boolean} gpuAcceleration=true
       * If true, it uses the CSS 3D transformation to position the popper.
       * Otherwise, it will use the `top` and `left` properties
       */
      gpuAcceleration: undefined
    }
  };

  /**
   * The `dataObject` is an object containing all the information used by Popper.js.
   * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
   * @name dataObject
   * @property {Object} data.instance The Popper.js instance
   * @property {String} data.placement Placement applied to popper
   * @property {String} data.originalPlacement Placement originally defined on init
   * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
   * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
   * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
   * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
   * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
   * @property {Object} data.boundaries Offsets of the popper boundaries
   * @property {Object} data.offsets The measurements of popper, reference and arrow elements
   * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
   * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
   * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
   */

  /**
   * Default options provided to Popper.js constructor.<br />
   * These can be overridden using the `options` argument of Popper.js.<br />
   * To override an option, simply pass an object with the same
   * structure of the `options` object, as the 3rd argument. For example:
   * ```
   * new Popper(ref, pop, {
   *   modifiers: {
   *     preventOverflow: { enabled: false }
   *   }
   * })
   * ```
   * @type {Object}
   * @static
   * @memberof Popper
   */
  var Defaults = {
    /**
     * Popper's placement.
     * @prop {Popper.placements} placement='bottom'
     */
    placement: 'bottom',

    /**
     * Set this to true if you want popper to position it self in 'fixed' mode
     * @prop {Boolean} positionFixed=false
     */
    positionFixed: false,

    /**
     * Whether events (resize, scroll) are initially enabled.
     * @prop {Boolean} eventsEnabled=true
     */
    eventsEnabled: true,

    /**
     * Set to true if you want to automatically remove the popper when
     * you call the `destroy` method.
     * @prop {Boolean} removeOnDestroy=false
     */
    removeOnDestroy: false,

    /**
     * Callback called when the popper is created.<br />
     * By default, it is set to no-op.<br />
     * Access Popper.js instance with `data.instance`.
     * @prop {onCreate}
     */
    onCreate: function onCreate() {},

    /**
     * Callback called when the popper is updated. This callback is not called
     * on the initialization/creation of the popper, but only on subsequent
     * updates.<br />
     * By default, it is set to no-op.<br />
     * Access Popper.js instance with `data.instance`.
     * @prop {onUpdate}
     */
    onUpdate: function onUpdate() {},

    /**
     * List of modifiers used to modify the offsets before they are applied to the popper.
     * They provide most of the functionalities of Popper.js.
     * @prop {modifiers}
     */
    modifiers: modifiers
  };

  /**
   * @callback onCreate
   * @param {dataObject} data
   */

  /**
   * @callback onUpdate
   * @param {dataObject} data
   */

  // Utils
  // Methods
  var Popper = function () {
    /**
     * Creates a new Popper.js instance.
     * @class Popper
     * @param {Element|referenceObject} reference - The reference element used to position the popper
     * @param {Element} popper - The HTML / XML element used as the popper
     * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
     * @return {Object} instance - The generated Popper.js instance
     */
    function Popper(reference, popper) {
      var _this = this;

      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      classCallCheck(this, Popper);

      this.scheduleUpdate = function () {
        return requestAnimationFrame(_this.update);
      };

      // make update() debounced, so that it only runs at most once-per-tick
      this.update = debounce(this.update.bind(this));

      // with {} we create a new object with the options inside it
      this.options = _extends({}, Popper.Defaults, options);

      // init state
      this.state = {
        isDestroyed: false,
        isCreated: false,
        scrollParents: []
      };

      // get reference and popper elements (allow jQuery wrappers)
      this.reference = reference && reference.jquery ? reference[0] : reference;
      this.popper = popper && popper.jquery ? popper[0] : popper;

      // Deep merge modifiers options
      this.options.modifiers = {};
      Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
        _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
      });

      // Refactoring modifiers' list (Object => Array)
      this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
        return _extends({
          name: name
        }, _this.options.modifiers[name]);
      })
      // sort the modifiers by order
      .sort(function (a, b) {
        return a.order - b.order;
      });

      // modifiers have the ability to execute arbitrary code when Popper.js get inited
      // such code is executed in the same order of its modifier
      // they could add new properties to their options configuration
      // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
      this.modifiers.forEach(function (modifierOptions) {
        if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
          modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
        }
      });

      // fire the first update to position the popper in the right place
      this.update();

      var eventsEnabled = this.options.eventsEnabled;
      if (eventsEnabled) {
        // setup event listeners, they will take care of update the position in specific situations
        this.enableEventListeners();
      }

      this.state.eventsEnabled = eventsEnabled;
    }

    // We can't use class properties because they don't get listed in the
    // class prototype and break stuff like Sinon stubs


    createClass(Popper, [{
      key: 'update',
      value: function update$$1() {
        return update.call(this);
      }
    }, {
      key: 'destroy',
      value: function destroy$$1() {
        return destroy.call(this);
      }
    }, {
      key: 'enableEventListeners',
      value: function enableEventListeners$$1() {
        return enableEventListeners.call(this);
      }
    }, {
      key: 'disableEventListeners',
      value: function disableEventListeners$$1() {
        return disableEventListeners.call(this);
      }

      /**
       * Schedules an update. It will run on the next UI update available.
       * @method scheduleUpdate
       * @memberof Popper
       */


      /**
       * Collection of utilities useful when writing custom modifiers.
       * Starting from version 1.7, this method is available only if you
       * include `popper-utils.js` before `popper.js`.
       *
       * **DEPRECATION**: This way to access PopperUtils is deprecated
       * and will be removed in v2! Use the PopperUtils module directly instead.
       * Due to the high instability of the methods contained in Utils, we can't
       * guarantee them to follow semver. Use them at your own risk!
       * @static
       * @private
       * @type {Object}
       * @deprecated since version 1.8
       * @member Utils
       * @memberof Popper
       */

    }]);
    return Popper;
  }();

  /**
   * The `referenceObject` is an object that provides an interface compatible with Popper.js
   * and lets you use it as replacement of a real DOM node.<br />
   * You can use this method to position a popper relatively to a set of coordinates
   * in case you don't have a DOM node to use as reference.
   *
   * ```
   * new Popper(referenceObject, popperNode);
   * ```
   *
   * NB: This feature isn't supported in Internet Explorer 10.
   * @name referenceObject
   * @property {Function} data.getBoundingClientRect
   * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
   * @property {number} data.clientWidth
   * An ES6 getter that will return the width of the virtual reference element.
   * @property {number} data.clientHeight
   * An ES6 getter that will return the height of the virtual reference element.
   */


  Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
  Popper.placements = placements;
  Popper.Defaults = Defaults;

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$3 = 'dropdown';
  var VERSION$3 = '0.5.2';
  var DATA_KEY$3 = 'sc.dropdown';
  var EVENT_KEY$3 = "." + DATA_KEY$3;
  var DATA_API_KEY$3 = '.data-api';
  var JQUERY_NO_CONFLICT$3 = $.fn[NAME$3];
  var ESCAPE_KEYCODE = 27; // Escキー

  var SPACE_KEYCODE = 32; // スペースキー

  var TAB_KEYCODE = 9; // タブキー

  var ARROW_UP_KEYCODE = 38; // ↑キー

  var ARROW_DOWN_KEYCODE = 40; // ↓キー

  var RIGHT_MOUSE_BUTTON_WHICH = 3; // マウスの右クリック
  // 正規表現オブジェクト作成

  var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE);
  var Event$3 = {
    HIDE: "hide" + EVENT_KEY$3,
    HIDDEN: "hidden" + EVENT_KEY$3,
    SHOW: "show" + EVENT_KEY$3,
    SHOWN: "shown" + EVENT_KEY$3,
    CLICK: "click" + EVENT_KEY$3,
    CLICK_DATA_API: "click" + EVENT_KEY$3 + DATA_API_KEY$3,
    KEYDOWN_DATA_API: "keydown" + EVENT_KEY$3 + DATA_API_KEY$3,
    KEYUP_DATA_API: "keyup" + EVENT_KEY$3 + DATA_API_KEY$3
  };
  var ClassName$3 = {
    DISABLED: 'disabled',
    SHOW: 'show',
    DROPUP: 'dropup',
    DROPRIGHT: 'dropright',
    DROPLEFT: 'dropleft',
    MENURIGHT: 'dropdown-menu-right',
    MENULEFT: 'dropdown-menu-left',
    POSITION_STATIC: 'position-static'
  };
  var Selector$3 = {
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
  var Default$1 = {
    offset: 0,
    flip: true,
    boundary: 'scrollParent',
    reference: 'toggle',
    display: 'dynamic',
    popperConfig: null
  };
  var DefaultType$1 = {
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

  var Dropdown = /*#__PURE__*/function () {
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
      if (this._element.disabled || $(this._element).hasClass(ClassName$3.DISABLED)) {
        return;
      } // メニューが.showを持ってるか判定


      var isActive = $(this._menu).hasClass(ClassName$3.SHOW); // メニューを閉じる

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
      if (this._element.disabled || $(this._element).hasClass(ClassName$3.DISABLED) || $(this._menu).hasClass(ClassName$3.SHOW)) {
        return;
      } // .dropdown-toggleをrelatedTargetに入れる


      var relatedTarget = {
        relatedTarget: this._element
      }; // show.sc.dropdownイベントを定義して、relatedTargetを渡す

      var showEvent = $.Event(Event$3.SHOW, relatedTarget); // エレメントの親要素を取得
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
          $(parent).addClass(ClassName$3.POSITION_STATIC);
        } // popperをインスタンス化
        // referenceElementはdata-toggle、this._menuはメニュー、this._getPopperConfig()はpopperのコンフィグ
        // ちなみにここでdropdownメニューを表示している


        this._popper = new Popper(referenceElement, this._menu, this._getPopperConfig());
      } // タッチデバイスの場合、空のマウスオーバリスナーを追加


      if ('ontouchstart' in document.documentElement && $(parent).closest(Selector$3.NAVBAR_NAV).length === 0) {
        $(document.body).children().on('mouseover', null, $.noop);
      } // フォーカスさせる。キーイベントのため？


      this._element.focus(); // showのときはaria-expanded属性を付与してtrueを設定する


      this._element.setAttribute('aria-expanded', true); // menuの.showを切り替える


      $(this._menu).toggleClass(ClassName$3.SHOW); // parentの.showを切り替えて、表示後のイベントをrelatedTargerに対して発動する

      $(parent).toggleClass(ClassName$3.SHOW).trigger($.Event(Event$3.SHOWN, relatedTarget));
    };

    _proto.hide = function hide() {
      // disableクラス、属性も持っていた場合と、メニューがshowを持っていた場合は処理を終了させる
      if (this._element.disabled || $(this._element).hasClass(ClassName$3.DISABLED) || !$(this._menu).hasClass(ClassName$3.SHOW)) {
        return;
      } // this._elementをターゲットにする


      var relatedTarget = {
        relatedTarget: this._element
      }; // ターゲットに対してhideイベントを定義する

      var hideEvent = $.Event(Event$3.HIDE, relatedTarget); // .dropdownを取得する

      var parent = Dropdown._getParentFromElement(this._element); // 親要素に対してhideイベントを実行する


      $(parent).trigger(hideEvent); // hideイベントがブラウザの動作を止めていたら処理を終了する

      if (hideEvent.isDefaultPrevented()) {
        return;
      } // popperがあった場合は、削除する


      if (this._popper) {
        this._popper.destroy();
      } // this._menuのshowクラスを切り替える


      $(this._menu).toggleClass(ClassName$3.SHOW); // 親要素に対して、showクラスを切り替えて、hiddenイベントを発動する

      $(parent).toggleClass(ClassName$3.SHOW).trigger($.Event(Event$3.HIDDEN, relatedTarget));
    };

    _proto.dispose = function dispose() {
      // this_elementのdata-apiを削除する
      $.removeData(this._element, DATA_KEY$3); // this_elementのイベントを削除

      $(this._element).off(EVENT_KEY$3);
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
      $(this._element).on(Event$3.CLICK, function (event) {
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
      NAME$3, // 上で作ったconfigが入ってる
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
          this._menu = parent.querySelector(Selector$3.MENU);
        }
      } // this._menuが存在してたらそのまま返す。
      // 存在してなかったら、取得して返す


      return this._menu;
    };

    _proto._getPlacement = function _getPlacement() {
      // this.elementの親要素を取得（.dropdown）
      var $parentDropdown = $(this._element.parentNode); // bottom-startを格納。初期値

      var placement = AttachmentMap.BOTTOM; // dropupを持ってたら

      if ($parentDropdown.hasClass(ClassName$3.DROPUP)) {
        // top-startを格納
        placement = AttachmentMap.TOP; // メニューがdropdown-menu-rightを持っていた場合

        if ($(this._menu).hasClass(ClassName$3.MENURIGHT)) {
          // top-endを格納
          placement = AttachmentMap.TOPEND;
        } // droprightを持っていた場合

      } else if ($parentDropdown.hasClass(ClassName$3.DROPRIGHT)) {
        // right-startを格納
        placement = AttachmentMap.RIGHT; // dropleftを持っていた場合
      } else if ($parentDropdown.hasClass(ClassName$3.DROPLEFT)) {
        // left-startを格納
        placement = AttachmentMap.LEFT; // dropdown-menu-rightを持っていた場合
      } else if ($(this._menu).hasClass(ClassName$3.MENURIGHT)) {
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
        var data = $(this).data(DATA_KEY$3); // configはtoggleの場合はnullになる。

        var _config = typeof config === 'object' ? config : null;

        if (!data) {
          // thisはdropdown-toggle(button)
          // つまりelement
          data = new Dropdown(this, _config); // elementにsc.dropdownでdataをセットする

          $(this).data(DATA_KEY$3, data);
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


      var toggles = [].slice.call(document.querySelectorAll(Selector$3.DATA_TOGGLE)); // 取得したtogglesの数だけループ回す

      for (var i = 0, len = toggles.length; i < len; i++) {
        // togglesの親ノードを取得する
        var parent = Dropdown._getParentFromElement(toggles[i]); // toggle要素のsc.dropdownを取得する
        // jqueryInterfaceをで設定してdataを取得する（dataはdropdownのコンストラクタで定義した変数）


        var context = $(toggles[i]).data(DATA_KEY$3); // 連想配列にtoggleを追加

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

        if (!$(parent).hasClass(ClassName$3.SHOW)) {
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


        var hideEvent = $.Event(Event$3.HIDE, relatedTarget); // parent要素に対して、hideEventを発生去せる
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


        $(dropdownMenu).removeClass(ClassName$3.SHOW); // parentの.showを削除してhiddenイベントを定義しつつ発動
        // parentは.dropdown

        $(parent).removeClass(ClassName$3.SHOW).trigger($.Event(Event$3.HIDDEN, relatedTarget));
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
      if (/input|textarea/i.test(event.target.tagName) ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE && (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE || $(event.target).closest(Selector$3.MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
        return;
      } // イベントを無効化して、伝藩しないようにする


      event.preventDefault();
      event.stopPropagation(); // disable属性または、disableクラスを持っていた場合、処理を終了する

      if (this.disabled || $(this).hasClass(ClassName$3.DISABLED)) {
        return;
      } // dropdownの親要素を取得する


      var parent = Dropdown._getParentFromElement(this); // parentが.showクラスを持っているか判定


      var isActive = $(parent).hasClass(ClassName$3.SHOW); // isActiveがfalseか、event.whichがエスケープキーだった場合、処理を終了させる

      if (!isActive && event.which === ESCAPE_KEYCODE) {
        return;
      } // isActiveがfalseまたは、isActiveがtrueかつエスケープキーが押下された場合もしくは、スペースキーが押下された場合


      if (!isActive || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {
        // エスキープキーだった場合
        if (event.which === ESCAPE_KEYCODE) {
          // parentのdata_toggleを持つ要素を取得
          var toggle = parent.querySelector(Selector$3.DATA_TOGGLE); // toggleをフォーカスする

          $(toggle).trigger('focus');
        } // クリップイベントを発動する


        $(this).trigger('click');
        return;
      } // disableしてないdropdown-menuとdropdown-itemを取得して、visibleのみを残す


      var items = [].slice.call(parent.querySelectorAll(Selector$3.VISIBLE_ITEMS)).filter(function (item) {
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
        return VERSION$3;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$1;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$1;
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
  .on(Event$3.KEYDOWN_DATA_API, Selector$3.DATA_TOGGLE, Dropdown._dataApiKeydownHandler) // .dropdown-menuのキーイベントを登録
  .on(Event$3.KEYDOWN_DATA_API, Selector$3.MENU, Dropdown._dataApiKeydownHandler) // メニュークリーンを登録
  .on(Event$3.CLICK_DATA_API + " " + Event$3.KEYUP_DATA_API, Dropdown._clearMenus) // [data-toggle="dropdown"]のイベント伝藩を止めて、jQueryInterfaceをcallする
  .on(Event$3.CLICK_DATA_API, Selector$3.DATA_TOGGLE, function (event) {
    event.preventDefault();
    event.stopPropagation();

    Dropdown._jQueryInterface.call($(this), 'toggle');
  }) // イベントが伝藩しないようにする
  .on(Event$3.CLICK_DATA_API, Selector$3.FORM_CHILD, function (e) {
    e.stopPropagation();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$3] = Dropdown._jQueryInterface;
  $.fn[NAME$3].Constructor = Dropdown;

  $.fn[NAME$3].noConflict = function () {
    $.fn[NAME$3] = JQUERY_NO_CONFLICT$3;
    return Dropdown._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$4 = 'modal';
  var VERSION$4 = '4.4.1';
  var DATA_KEY$4 = 'sc.modal';
  var EVENT_KEY$4 = "." + DATA_KEY$4;
  var DATA_API_KEY$4 = '.data-api';
  var JQUERY_NO_CONFLICT$4 = $.fn[NAME$4];
  var ESCAPE_KEYCODE$1 = 27; // エスケープキー

  var Default$2 = {
    backdrop: true,
    keyboard: true,
    focus: true,
    show: true
  };
  var DefaultType$2 = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    focus: 'boolean',
    show: 'boolean'
  };
  var Event$4 = {
    HIDE: "hide" + EVENT_KEY$4,
    HIDE_PREVENTED: "hidePrevented" + EVENT_KEY$4,
    HIDDEN: "hidden" + EVENT_KEY$4,
    SHOW: "show" + EVENT_KEY$4,
    SHOWN: "shown" + EVENT_KEY$4,
    FOCUSIN: "focusin" + EVENT_KEY$4,
    RESIZE: "resize" + EVENT_KEY$4,
    CLICK_DISMISS: "click.dismiss" + EVENT_KEY$4,
    KEYDOWN_DISMISS: "keydown.dismiss" + EVENT_KEY$4,
    MOUSEUP_DISMISS: "mouseup.dismiss" + EVENT_KEY$4,
    MOUSEDOWN_DISMISS: "mousedown.dismiss" + EVENT_KEY$4,
    CLICK_DATA_API: "click" + EVENT_KEY$4 + DATA_API_KEY$4
  };
  var ClassName$4 = {
    SCROLLABLE: 'modal-dialog-scrollable',
    SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
    BACKDROP: 'modal-backdrop',
    OPEN: 'modal-open',
    FADE: 'fade',
    SHOW: 'show',
    STATIC: 'modal-static'
  };
  var Selector$4 = {
    DIALOG: '.modal-dialog',
    MODAL_BODY: '.modal-body',
    DATA_TOGGLE: '[data-toggle="modal"]',
    DATA_DISMISS: '[data-dismiss="modal"]',
    FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
    STICKY_CONTENT: '.sticky-top'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Modal = /*#__PURE__*/function () {
    function Modal(element, config) {
      // configを取得
      this._config = this._getConfig(config); // modal要素

      this._element = element; // .modal-dialog要素を取得する

      this._dialog = element.querySelector(Selector$4.DIALOG);
      this._backdrop = null;
      this._isShown = false;
      this._isBodyOverflowing = false;
      this._ignoreBackdropClick = false;
      this._isTransitioning = false;
      this._scrollbarWidth = 0;
    } // Getters


    var _proto = Modal.prototype;

    // Public
    _proto.toggle = function toggle(relatedTarget) {
      // isShownがtrueだった場合は、hideを実行
      // falseの場合は、クリックされるbtn要素を引数に、showを実行
      return this._isShown ? this.hide() : this.show(relatedTarget);
    };

    _proto.show = function show(relatedTarget) {
      var _this = this;

      // isShownか_isTransitioningがtrueの場合は処理終了
      if (this._isShown || this._isTransitioning) {
        return;
      } // modal要素が、fadeクラスを持っていたら


      if ($(this._element).hasClass(ClassName$4.FADE)) {
        // _isTransitioningにtrueを代入
        this._isTransitioning = true;
      } // showイベントをrelatedTargetに対して、定義する。


      var showEvent = $.Event(Event$4.SHOW, {
        relatedTarget: relatedTarget
      }); // modalイベントに対してshowイベントを発動する

      $(this._element).trigger(showEvent); // isShownがtrueもしくは、showEvenetがブラウザの動作を停止していた場合
      // 処理終了

      if (this._isShown || showEvent.isDefaultPrevented()) {
        return;
      } // isShownをtrueにする


      this._isShown = true; // スクロールバーが存在するか確認し
      // スクロールバーの横幅を取得

      this._checkScrollbar(); // .modal-openでoverflow: hiddenにしたとき、
      // 表示がくずれない用に、paddingかmarginを調整する


      this._setScrollbar(); // modal要素の幅をスクロールバーに合わせて調整


      this._adjustDialog(); // ESCキー押下時のイベントをmodal要素に対して設定
      // .modal-staticが付与されていたらアニメーションしながらフォーカスする。付与されていなかったらhide


      this._setEscapeEvent(); // windowリサイズ時に、modal要素の横幅を調整する
      // イベントを定義


      this._setResizeEvent(); // modal要素に、click-dismissイベントを設定
      // 対象セクレタのdata-dismiss='modal'クリック時に
      // modalをhideする


      $(this._element).on(Event$4.CLICK_DISMISS, Selector$4.DATA_DISMISS, function (event) {
        return _this.hide(event);
      }); // .modal-dialog要素に、マウスボタン押下時のイベントを定義する

      $(this._dialog).on(Event$4.MOUSEDOWN_DISMISS, function () {
        // modal要素に対して、マウスボタンが離れた時のイベントをバインドする
        $(_this._element).one(Event$4.MOUSEUP_DISMISS, function (event) {
          // event.target(マウスが離れた場所)とmodal要素が一致していた場合
          if ($(event.target).is(_this._element)) {
            _this._ignoreBackdropClick = true;
          }
        });
      }); // _showBackdropはmodalが表示されていたらbackdropを表示して_showElementを実行
      // modalが非表示ならbackdropを削除して_showElementを実行
      // _config.backdropがfalseならcallbackを実行するだけ
      // showElementはmodalを表示する

      this._showBackdrop(function () {
        return _this._showElement(relatedTarget);
      });
    };

    _proto.hide = function hide(event) {
      var _this2 = this;

      // イベントがあったら停止
      if (event) {
        event.preventDefault();
      } // modalが表示されているか、遷移中なら処理終了


      if (!this._isShown || this._isTransitioning) {
        return;
      } // hideイベントを定義する


      var hideEvent = $.Event(Event$4.HIDE); // modal要素に対して、hideイベントを実行する

      $(this._element).trigger(hideEvent); // modalが表示いないまたは、hideEventがブラウザの動作を停止させている場合は処理終了

      if (!this._isShown || hideEvent.isDefaultPrevented()) {
        return;
      } // isShownをfalseにする


      this._isShown = false; // modal要素が.fadeを持っているか判定

      var transition = $(this._element).hasClass(ClassName$4.FADE); // modal要素が.fadeを持っている場合

      if (transition) {
        // _isTransitioningをtrueにする
        this._isTransitioning = true;
      } // modal要素からエスケープキーでmodalをhideするイベントを削除する


      this._setEscapeEvent(); // modal要素からブラウザのリサイズイベントを削除する


      this._setResizeEvent(); // focusinイベントを削除


      $(document).off(Event$4.FOCUSIN); // modal要素から.showを削除する

      $(this._element).removeClass(ClassName$4.SHOW); // modal要素からクリックを離した時のイベントを削除する

      $(this._element).off(Event$4.CLICK_DISMISS); // dialogからマウスダウンを離したときのイベントを削除する

      $(this._dialog).off(Event$4.MOUSEDOWN_DISMISS); // modal要素が.fadeを持っていたら

      if (transition) {
        // modal要素の遷移時間を取得する
        var transitionDuration = Util.getTransitionDurationFromElement(this._element); // 遷移終了時にmodalを非表示にする

        $(this._element).one(Util.TRANSITION_END, function (event) {
          return _this2._hideModal(event);
        }).emulateTransitionEnd(transitionDuration);
      } else {
        // modalを非表示にする
        this._hideModal();
      }
    };

    _proto.dispose = function dispose() {
      // window、this_element、this._dialogのイベントを削除する
      [window, this._element, this._dialog].forEach(function (htmlElement) {
        return $(htmlElement).off(EVENT_KEY$4);
      }); // documentには、Event.FOCUSIN`と `Event.CLICK_DATA_APIの2つのイベントがある
      // documentのfocusinイベントを削除

      $(document).off(Event$4.FOCUSIN); // modal要素からdata_keyを削除する

      $.removeData(this._element, DATA_KEY$4); // 各種設定初期化

      this._config = null;
      this._element = null;
      this._dialog = null;
      this._backdrop = null;
      this._isShown = null;
      this._isBodyOverflowing = null;
      this._ignoreBackdropClick = null;
      this._isTransitioning = null;
      this._scrollbarWidth = null;
    };

    _proto.handleUpdate = function handleUpdate() {
      // modal要素の幅をスクロールバーに合わせて調整
      this._adjustDialog();
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      // configにDefaultとconfigを格納する
      config = _objectSpread2({}, Default$2, {}, config); // configの型がDefaultTypeと一致しているか確認
      // 一致していなかった場合は、エラー

      Util.typeCheckConfig(NAME$4, config, DefaultType$2); // configを返す

      return config;
    };

    _proto._triggerBackdropTransition = function _triggerBackdropTransition() {
      var _this3 = this;

      // .modal-staticはアニメーションで要素をフォーカスする
      // _config.backdropがstaticの場合（Defaultではstatic）
      if (this._config.backdrop === 'static') {
        // hidePreventedイベントを定義する
        var hideEventPrevented = $.Event(Event$4.HIDE_PREVENTED); // modal要素に対してhideEventPreventedを実行する

        $(this._element).trigger(hideEventPrevented); // イベントでブラウザのデフォルトの動作が停止されていた場合は処理終了

        if (hideEventPrevented.defaultPrevented) {
          return;
        } // modal要素に.staticを追加


        this._element.classList.add(ClassName$4.STATIC); // modal要素の遷移時間を取得


        var modalTransitionDuration = Util.getTransitionDurationFromElement(this._element); // 遷移終了時のイベントをバインド

        $(this._element).one(Util.TRANSITION_END, function () {
          // modal要素から.staticを削除
          _this3._element.classList.remove(ClassName$4.STATIC);
        }).emulateTransitionEnd(modalTransitionDuration); // 遷移終了時のイベントを実行

        this._element.focus(); // modal要素にフォーカスする

      } else {
        // this._config.backdropがstaticじゃない場合は
        // hideを実行
        this.hide();
      }
    };

    _proto._showElement = function _showElement(relatedTarget) {
      var _this4 = this;

      // relatedTargetはbtnとかのトリガー要素
      // this._elementはmodal要素
      // modal要素が.fadeを持っているか判定
      var transition = $(this._element).hasClass(ClassName$4.FADE); // this._dialogが存在する場合は、modal-body要素を取得する。
      // 存在しない場合は、null

      var modalBody = this._dialog ? this._dialog.querySelector(Selector$4.MODAL_BODY) : null; // modal要素の親要素が存在していないまたは、
      // parentNodeのがエレメントじゃない場合

      if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
        // bodyにmodal要素を追加する
        document.body.appendChild(this._element);
      } // modal要素にdisplay:block;を設定する


      this._element.style.display = 'block'; // modal要素のaria-hidden属性を削除する

      this._element.removeAttribute('aria-hidden'); // modal要素に、aria-modal="true"を設定する


      this._element.setAttribute('aria-modal', true); // .modal-dialogが.modal-dialog-scrollableを持っているかつ、
      // .modal-body要素が存在する場合


      if ($(this._dialog).hasClass(ClassName$4.SCROLLABLE) && modalBody) {
        // .modal-bodyのスクロール位置を0にする
        modalBody.scrollTop = 0;
      } else {
        // modal要素のスクロール位置を0にする
        this._element.scrollTop = 0;
      } // modal要素が.fadeを持っている場合


      if (transition) {
        // modal要素のpaddingとborderを含む
        // 高さを取得する
        Util.reflow(this._element);
      } // modal要素に.showを追加する


      $(this._element).addClass(ClassName$4.SHOW); // _config.focusがtrueの場合

      if (this._config.focus) {
        // modal要素をフォーカスする
        this._enforceFocus();
      } // shownイベントを定義する


      var shownEvent = $.Event(Event$4.SHOWN, {
        relatedTarget: relatedTarget
      }); // 遷移完了後のイベントを定義

      var transitionComplete = function transitionComplete() {
        // _config.focusがtrueならフォーカスする
        if (_this4._config.focus) {
          _this4._element.focus();
        } // _isTransitioningをfalseにする


        _this4._isTransitioning = false; // modal要素に対して、shownEventを発動する

        $(_this4._element).trigger(shownEvent);
      }; // modal要素が.fadeを持っている場合


      if (transition) {
        // .modal-dialog要素から遷移時間を取得
        var transitionDuration = Util.getTransitionDurationFromElement(this._dialog); // modal-dialogにtransisionendイベントをバインドして
        // 遷移時間分ずらして実行

        $(this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(transitionDuration);
      } else {
        // modal要素が.fadeをもっていない場合は、
        // transitionCompleteを実行する
        transitionComplete();
      }
    } // modal要素をフォーカスする
    ;

    _proto._enforceFocus = function _enforceFocus() {
      var _this5 = this;

      $(document).off(Event$4.FOCUSIN) // 無限フォーカスループにならないように、フォーカスイベントを削除する
      .on(Event$4.FOCUSIN, function (event) {
        // フォーカスイベントをバインドする
        if (document !== event.target && // event.targetとdocumentが一致しない
        _this5._element !== event.target && // event.targetとmodal要素が一致しない
        $(_this5._element).has(event.target).length === 0) {
          // modal要素にevent.targetが存在しない場合
          // modal要素をフォーカスする
          _this5._element.focus();
        }
      });
    };

    _proto._setEscapeEvent = function _setEscapeEvent() {
      var _this6 = this;

      if (this._isShown) {
        // isShownがtrueだった場合（show関数の冒頭でtrueにしてる）
        // modal要素に、keydown.dismissイベントをバインドする
        $(this._element).on(Event$4.KEYDOWN_DISMISS, function (event) {
          //  _config.keyboardがtrueで、エスケープキーを謳歌された場合
          if (_this6._config.keyboard && event.which === ESCAPE_KEYCODE$1) {
            // エスケープキーのデフォルト動作を停止する
            event.preventDefault(); // hideを実行

            _this6.hide();
          } else if (!_this6._config.keyboard && event.which === ESCAPE_KEYCODE$1) {
            // _config.keyboardがfalseで、エスケープキーが押下されたとき
            // backdropが'static'の場合は、要素をアニメーションしながらフォーカスする
            // staticじゃない場合はhideする
            _this6._triggerBackdropTransition();
          }
        });
      } else if (!this._isShown) {
        // modalが表示されていないとき
        // modalから、キーイベントを削除する
        $(this._element).off(Event$4.KEYDOWN_DISMISS);
      }
    };

    _proto._setResizeEvent = function _setResizeEvent() {
      var _this7 = this;

      // modalが表示されていたら
      if (this._isShown) {
        // windowのリサイズ時イベントを設定する
        // modal要素の幅をスクロールバーに合わせて調整
        $(window).on(Event$4.RESIZE, function (event) {
          return _this7.handleUpdate(event);
        });
      } else {
        // modalが表示されていない場合は、リサイズイベント削除
        $(window).off(Event$4.RESIZE);
      }
    };

    _proto._hideModal = function _hideModal() {
      var _this8 = this;

      // modal要素にdisplay:none;を設定する
      this._element.style.display = 'none'; // modal要素にaria-hidden='true'を付与する

      this._element.setAttribute('aria-hidden', true); // modal要素からaria-modal属性を削除する


      this._element.removeAttribute('aria-modal'); // _isTransitioningをfasleにする


      this._isTransitioning = false; // backdropを削除する

      this._showBackdrop(function () {
        $(document.body).removeClass(ClassName$4.OPEN); // modyの.modal-openを削除する

        _this8._resetAdjustments(); // modal要素から左右のpaddingを削除する


        _this8._resetScrollbar(); // setScrollbarで設定したpaddingとかを削除する
        // hiddenイベントを発動する


        $(_this8._element).trigger(Event$4.HIDDEN);
      });
    };

    _proto._removeBackdrop = function _removeBackdrop() {
      if (this._backdrop) {
        // backdrop要素が存在していた場合
        $(this._backdrop).remove(); // backdrop要素を削除

        this._backdrop = null; // backdrop要素をnullにする
      }
    } // callbackは関数
    ;

    _proto._showBackdrop = function _showBackdrop(callback) {
      var _this9 = this;

      // backdropはmodal表示時の背景
      // http://bootstrap3.cyberlab.info/javascript/modals-options-backdrop.html#usage2
      // modal要素が.fadeを持っている場合はfadeを格納
      // 持っていない場合は空文字
      var animate = $(this._element).hasClass(ClassName$4.FADE) ? ClassName$4.FADE : ''; // _isShownと_config.backdropがtrueの場合
      // modalをshowするとき

      if (this._isShown && this._config.backdrop) {
        // _backdropに<div>を作成する
        this._backdrop = document.createElement('div'); // divに.modal-backdropを付与する

        this._backdrop.className = ClassName$4.BACKDROP; // modal要素が.fadeを持っていた場合

        if (animate) {
          // backdropに.fadeを追加
          this._backdrop.classList.add(animate);
        } // body要素にdiv.modal-backdrop要素を追加


        $(this._backdrop).appendTo(document.body); // クリックを離したときにのイベントを定義

        $(this._element).on(Event$4.CLICK_DISMISS, function (event) {
          // this._ignoreBackdropClickがtrueの場合
          if (_this9._ignoreBackdropClick) {
            // falseにして、処理を終了する
            _this9._ignoreBackdropClick = false;
            return;
          } // クリックを離したところと、イベントハンドラがアタッチされた要素が一致しない場合


          if (event.target !== event.currentTarget) {
            // 処理を終了する
            return;
          } // backdropが'static'の場合は、要素をアニメーションしながらフォーカスする
          // staticじゃない場合はhideする


          _this9._triggerBackdropTransition();
        }); // modal要素が.fadeを持っていた場合

        if (animate) {
          // backdropの高さを取得する
          Util.reflow(this._backdrop);
        } // backdropに.showを追加する


        $(this._backdrop).addClass(ClassName$4.SHOW); // callbackが存在しない場合は処理終了

        if (!callback) {
          return;
        } // .fadeが付与されていなかったらcallbackを実行して処理終了


        if (!animate) {
          callback();
          return;
        } // 以下は、.fadeがmodal要素に付与されていて、callabckが存在する場合
        // backdropの遷移時間を取得する


        var backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop); // backdropの遷移終了時のイベントを定義し、
        // 遷移時間の分だけ送らせて実行

        $(this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(backdropTransitionDuration);
      } else if (!this._isShown && this._backdrop) {
        // isShownがfalseで、backdropがtrueの場合
        // modalをhideするとき
        // backdrop要素から.showを削除
        $(this._backdrop).removeClass(ClassName$4.SHOW); // backdropを削除する関数を定義

        var callbackRemove = function callbackRemove() {
          _this9._removeBackdrop(); // backdropを削除


          if (callback) {
            // callback関数が存在していたら実行
            callback();
          }
        }; // modal要素が.fadeを持っていたら


        if ($(this._element).hasClass(ClassName$4.FADE)) {
          // backdropの遷移時間を取得する
          var _backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop); // backdropの遷移終了時にcallbackRemoveを実行


          $(this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(_backdropTransitionDuration);
        } else {
          // .fadeがなかったらそのままbackdropを削除
          callbackRemove();
        }
      } else if (callback) {
        // _config.backdropがfalseの場合は、
        // callbackを実行
        callback();
      }
    } // ----------------------------------------------------------------------
    // the following methods are used to handle overflowing modals
    // todo (fat): these should probably be refactored out of modal.js
    // ----------------------------------------------------------------------
    ;

    _proto._adjustDialog = function _adjustDialog() {
      // this._elementはmodal要素
      // modal要素の高さが、ブラウザの表示高さを超えていた場合は、true
      // this.elementは表示されてないから、基本は0
      var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight; // _isBodyOverflowingがfalseで、isModalOverflowingがtrueの場合

      if (!this._isBodyOverflowing && isModalOverflowing) {
        // modal要素の実際のpadding-leftをスクロールバーの幅にする
        this._element.style.paddingLeft = this._scrollbarWidth + "px";
      } // _isBodyOverflowingがtrueで、isModalOverflowingがfalseの場合


      if (this._isBodyOverflowing && !isModalOverflowing) {
        // modal要素の実際のpadding-rightをスクロールバーの幅にする
        this._element.style.paddingRight = this._scrollbarWidth + "px";
      }
    };

    _proto._resetAdjustments = function _resetAdjustments() {
      // modal要素から左右のpaddingを削除する
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    };

    _proto._checkScrollbar = function _checkScrollbar() {
      // body要素の幅を取得
      var rect = document.body.getBoundingClientRect(); // body要素の幅(right+left)がwindowのコンテンツ幅より小さいか判定
      // つまりX方向にスクロールバーがあるか確認

      this._isBodyOverflowing = rect.left + rect.right < window.innerWidth; // スクロールバーの横幅を取得

      this._scrollbarWidth = this._getScrollbarWidth();
    };

    _proto._setScrollbar = function _setScrollbar() {
      var _this10 = this;

      // body要素がはみ出ていた場合
      if (this._isBodyOverflowing) {
        // DOMNode.style.paddingRightは実際の値を返す。設定されていない場合は''を返す
        // $(DOMNode).css('padding-right')はcssの値を返す。設定されていない場合は''を返す
        // .fixed-top、.fixed-bottom、.is-fixed、.sticky-topを持つ要素を取得する
        var fixedContent = [].slice.call(document.querySelectorAll(Selector$4.FIXED_CONTENT)); // .sticky-topを持つ要素を取得する

        var stickyContent = [].slice.call(document.querySelectorAll(Selector$4.STICKY_CONTENT)); // 固定コンテンツのpaddingを調整する

        $(fixedContent).each(function (index, element) {
          // fixedContentの実際のpadding-rightを取得する
          var actualPadding = element.style.paddingRight; // fixedContentにcssで設定されているpadding-rightを取得

          var calculatedPadding = $(element).css('padding-right');
          $(element).data('padding-right', actualPadding) // elementに実際のpadding-rightを設定する
          .css('padding-right', parseFloat(calculatedPadding) + _this10._scrollbarWidth + "px"); // elementのpadding-rightにスクロールバーの横幅を足した値を設定する
        }); // stickyコンテンツのmarginを調整する

        $(stickyContent).each(function (index, element) {
          // stickyコンテンツの実際のmargin-rightを取得する
          var actualMargin = element.style.marginRight; // stickyコンテンツにcssで指定されているmargin-rightを取得する

          var calculatedMargin = $(element).css('margin-right');
          $(element).data('margin-right', actualMargin) // elementに実際のmargin-rightを設定する
          .css('margin-right', parseFloat(calculatedMargin) - _this10._scrollbarWidth + "px"); // elementのmargin-rightにスクロールバーの横幅を足した値を設定する
        }); // body要素のpaddingを調整する
        // body要素の実際のpadding-rightを取得する

        var actualPadding = document.body.style.paddingRight; // body要素にcssで指定されているpadding-rightを取得する

        var calculatedPadding = $(document.body).css('padding-right');
        $(document.body).data('padding-right', actualPadding) // body要素に実際のpadding-rightを設定する
        .css('padding-right', parseFloat(calculatedPadding) + this._scrollbarWidth + "px"); // body要素のpadding-rightにスクロールバーの横幅を足した値を設定する
      } // body要素に.modal-openを追加する
      // overflow: hidden;でスクロールバーがなくなった時に、表示がずれないようにするため


      $(document.body).addClass(ClassName$4.OPEN);
    };

    _proto._resetScrollbar = function _resetScrollbar() {
      // fixedコンテンツのpaddindを戻す
      // fixedクラスを持つ要素を取得
      var fixedContent = [].slice.call(document.querySelectorAll(Selector$4.FIXED_CONTENT));
      $(fixedContent).each(function (index, element) {
        // _setScrollbarで設定したpadding-rightを取得する
        var padding = $(element).data('padding-right'); // padding-right属性を削除

        $(element).removeData('padding-right'); // paddingが存在したらそれを代入。なかったら空文字

        element.style.paddingRight = padding ? padding : '';
      }); // stickyコンテンツのpaddingを戻す
      // .sticky-topが付与された要素を収録

      var elements = [].slice.call(document.querySelectorAll("" + Selector$4.STICKY_CONTENT));
      $(elements).each(function (index, element) {
        // 要素からmargin-rightを取得
        var margin = $(element).data('margin-right'); // marginがundefinedじゃなかったら

        if (typeof margin !== 'undefined') {
          // .sticky-topのmargin-rightを削除する
          $(element).css('margin-right', margin).removeData('margin-right');
        }
      }); // bodyのpadding-rightを戻す

      var padding = $(document.body).data('padding-right'); // modyのpadding-rightを咲くjおする

      $(document.body).removeData('padding-right'); // paddingが存在したらその値、なかったら空文字

      document.body.style.paddingRight = padding ? padding : '';
    };

    _proto._getScrollbarWidth = function _getScrollbarWidth() {
      // thx d.walsh
      // div要素を作成
      var scrollDiv = document.createElement('div'); // divに.modal-scrollbar-measurerを付与

      scrollDiv.className = ClassName$4.SCROLLBAR_MEASURER; // scrolldivをbody要素に追加

      document.body.appendChild(scrollDiv); // scrollDiv.getBoundingClientRectはscssで指定したwidthを取得(50px)
      // clientWidthはスクロールバーの横幅を含まないscrollDivの横幅を取得
      // これを引くと、スクロールバーの横幅になる

      var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth; // scrollDivを削除

      document.body.removeChild(scrollDiv); // スクロールバーの横幅を返す

      return scrollbarWidth;
    } // Static
    // relatedTargetはクリックされるbtn要素
    ;

    Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        // thisはmodal要素
        // thisのDATA_KEYを取得
        var data = $(this).data(DATA_KEY$4); // _configに値を格納する

        var _config = _objectSpread2({}, Default$2, {}, $(this).data(), {}, typeof config === 'object' && config ? config : {}); // dataが存在していなかったら


        if (!data) {
          // modalをインスタンス化してdataに格納する
          data = new Modal(this, _config); // dataをmodal要素に入れる

          $(this).data(DATA_KEY$4, data);
        } // configがStringの場合


        if (typeof config === 'string') {
          // modalクラスにメソッドが存在するか確認
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          } // メソッドが存在した場合は、relatedTargetを引数に実行する


          data[config](relatedTarget);
        } else if (_config.show) {
          // _config.showがtrueの場合
          // relatedTargetを引数にshowを実行する
          data.show(relatedTarget);
        }
      });
    };

    _createClass(Modal, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$4;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$2;
      }
    }]);

    return Modal;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */
  // sc.modal.data-apiのイベントを定義する
  // 対象は、 [data-toggle="modal"]


  $(document).on(Event$4.CLICK_DATA_API, Selector$4.DATA_TOGGLE, function (event) {
    var _this11 = this;

    var target; // thisは[data-toggle="modal"]が付与されているelement
    // [data-toggle="modal"]要素で指定されている['data-target"]かhrefを取得する
    // つまり、modal要素

    var selector = Util.getSelectorFromElement(this); // selectorが存在したら

    if (selector) {
      // targetにselectorを元に取得した要素を格納する
      target = document.querySelector(selector);
    } // $(target).data(DATA_KEY)が存在したら'toggle'を格納する
    // 存在していない場合は、


    var config = $(target).data(DATA_KEY$4) ? 'toggle' : _objectSpread2({}, $(target).data(), {}, $(this).data()); // thisのhtmlが<a>か<area>だったらブラウザのデフォルト動作を禁止する
    // <a>クリックでページが変わるとか

    if (this.tagName === 'A' || this.tagName === 'AREA') {
      event.preventDefault();
    } // modalのshowイベントをバインドしてshow時に無名関数を実行する


    var $target = $(target).one(Event$4.SHOW, function (showEvent) {
      // showEventがブラウザの動作を停止していたら
      if (showEvent.isDefaultPrevented()) {
        // modalが実際に表示される場合のみforcusする
        return;
      } // modalのhiddenイベントをバインドして、hidden時に無名関数を実行する


      $target.one(Event$4.HIDDEN, function () {
        // thisは[data-toggle="modal"]が付与された要素
        // それが表示状態なら
        if ($(_this11).is(':visible')) {
          // focusする
          _this11.focus();
        }
      });
    }); // configとthisはjQueryInterfaceに渡す引数

    Modal._jQueryInterface.call($(target), config, this);
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$4] = Modal._jQueryInterface;
  $.fn[NAME$4].Constructor = Modal;

  $.fn[NAME$4].noConflict = function () {
    $.fn[NAME$4] = JQUERY_NO_CONFLICT$4;
    return Modal._jQueryInterface;
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

  var NAME$5 = 'tooltip';
  var VERSION$5 = '4.4.1';
  var DATA_KEY$5 = 'sc.tooltip';
  var EVENT_KEY$5 = "." + DATA_KEY$5;
  var JQUERY_NO_CONFLICT$5 = $.fn[NAME$5];
  var CLASS_PREFIX = 'sc-tooltip';
  var SCCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];
  var DefaultType$3 = {
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
  var Default$3 = {
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
  var Event$5 = {
    HIDE: "hide" + EVENT_KEY$5,
    HIDDEN: "hidden" + EVENT_KEY$5,
    SHOW: "show" + EVENT_KEY$5,
    SHOWN: "shown" + EVENT_KEY$5,
    INSERTED: "inserted" + EVENT_KEY$5,
    CLICK: "click" + EVENT_KEY$5,
    FOCUSIN: "focusin" + EVENT_KEY$5,
    FOCUSOUT: "focusout" + EVENT_KEY$5,
    MOUSEENTER: "mouseenter" + EVENT_KEY$5,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$5
  };
  var ClassName$5 = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$5 = {
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
        if ($(this.getTipElement()).hasClass(ClassName$5.SHOW)) {
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
          $(tip).addClass(ClassName$5.FADE);
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

        $(tip).addClass(ClassName$5.SHOW); // iOSのために、空のマウスオーバリスナーを追加
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


        if ($(this.tip).hasClass(ClassName$5.FADE)) {
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


      $(tip).removeClass(ClassName$5.SHOW); // iOSのために、空のマウスオーバリスナーを追加
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

      if ('ontouchstart' in document.documentElement) {
        $(document.body).children().off('mouseover', null, $.noop);
      } // activeTriggerのclick、focus、hoverをfalseにする


      this._activeTrigger[Trigger.CLICK] = false;
      this._activeTrigger[Trigger.FOCUS] = false;
      this._activeTrigger[Trigger.HOVER] = false; // tipがfadeクラスを持ってたら

      if ($(this.tip).hasClass(ClassName$5.FADE)) {
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

      this.setElementContent($(tip.querySelectorAll(Selector$5.TOOLTIP_INNER)), this.getTitle()); // tipからfadeとshowクラスを削除する

      $(tip).removeClass(ClassName$5.FADE + " " + ClassName$5.SHOW);
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
            element: Selector$5.ARROW
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


      if ($(context.getTipElement()).hasClass(ClassName$5.SHOW) || context._hoverState === HoverState.SHOW) {
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


      Util.typeCheckConfig(NAME$5, config, this.constructor.DefaultType); // config.sanitizeがtrueなら
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


      $(tip).removeClass(ClassName$5.FADE); // configのanimetionをfalseにする

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
        var data = $(this).data(DATA_KEY$5); // configがobjectならobjectを_configに入れる
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

          $(this).data(DATA_KEY$5, data);
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
        return VERSION$5;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$3;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME$5;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY$5;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event$5;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY$5;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$3;
      }
    }]);

    return Tooltip;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$5] = Tooltip._jQueryInterface;
  $.fn[NAME$5].Constructor = Tooltip;

  $.fn[NAME$5].noConflict = function () {
    $.fn[NAME$5] = JQUERY_NO_CONFLICT$5;
    return Tooltip._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$6 = 'popover';
  var VERSION$6 = '4.4.1';
  var DATA_KEY$6 = 'sc.popover';
  var EVENT_KEY$6 = "." + DATA_KEY$6;
  var JQUERY_NO_CONFLICT$6 = $.fn[NAME$6];
  var CLASS_PREFIX$1 = 'sc-popover';
  var SCCLS_PREFIX_REGEX$1 = new RegExp("(^|\\s)" + CLASS_PREFIX$1 + "\\S+", 'g');

  var Default$4 = _objectSpread2({}, Tooltip.Default, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip">' + '<div class="arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div></div>'
  });

  var DefaultType$4 = _objectSpread2({}, Tooltip.DefaultType, {
    content: '(string|element|function)'
  });

  var ClassName$6 = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$6 = {
    TITLE: '.popover-header',
    CONTENT: '.popover-body'
  };
  var Event$6 = {
    HIDE: "hide" + EVENT_KEY$6,
    HIDDEN: "hidden" + EVENT_KEY$6,
    SHOW: "show" + EVENT_KEY$6,
    SHOWN: "shown" + EVENT_KEY$6,
    INSERTED: "inserted" + EVENT_KEY$6,
    CLICK: "click" + EVENT_KEY$6,
    FOCUSIN: "focusin" + EVENT_KEY$6,
    FOCUSOUT: "focusout" + EVENT_KEY$6,
    MOUSEENTER: "mouseenter" + EVENT_KEY$6,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$6
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */
  // Tooltipを継承するみたい

  var Popover = /*#__PURE__*/function (_Tooltip) {
    _inheritsLoose(Popover, _Tooltip);

    function Popover() {
      return _Tooltip.apply(this, arguments) || this;
    }

    var _proto = Popover.prototype;

    // Overrides
    // tooltipのメソッドを書き換える
    // 存在した場合はtooltipのshowを継続する
    _proto.isWithContent = function isWithContent() {
      // 存在する方のみ返す
      return this.getTitle() || this._getContent();
    };

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      // popoverのCLASS_PREFIXが使われるようにする
      $(this.getTipElement()).addClass(CLASS_PREFIX$1 + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      // ここで、オーバライドしているのはpopoverの$(this.config.template)[0]を使うため
      this.tip = this.tip || $(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      // tipのelementを取得する
      var $tip = $(this.getTipElement()); // jsイベントを維持するために、htmlにappendを使用する
      // .popover-headerと['data-original-title']属性のタイトルが引数
      // .popover-headerにthis.getTitle()で取得したテキストを設定する

      this.setElementContent($tip.find(Selector$6.TITLE), this.getTitle()); // ['data-content']属性の値を取得

      var content = this._getContent(); // コンテンツがfunctionの場合


      if (typeof content === 'function') {
        // this.elementに対してcontent関数を実行し、その結果をコンテンツに格納する
        content = content.call(this.element);
      } // .popover-bodyに対して、contentのテキストを設定する


      this.setElementContent($tip.find(Selector$6.CONTENT), content); // tipのfadeクラスとshowクラスを削除する

      $tip.removeClass(ClassName$6.FADE + " " + ClassName$6.SHOW);
    } // Private
    ;

    _proto._getContent = function _getContent() {
      // ['data-content']属性が存在していた場合は、その値を返す
      // 存在しなかった場合はconfig.contentを返す
      return this.element.getAttribute('data-content') || this.config.content;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      // tipの要素を取得
      var $tip = $(this.getTipElement()); // tipに.sc-popoverに関連クラスがあるか確認する

      var tabClass = $tip.attr('class').match(SCCLS_PREFIX_REGEX$1); // tabClassが存在していて、tabClassの長さが0以上の場合

      if (tabClass !== null && tabClass.length > 0) {
        // TabClassに該当するクラスを全て削除する
        $tip.removeClass(tabClass.join(''));
      }
    } // Static
    ;

    Popover._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // thisはdata-toggle="popover"を持った要素
        // その要素から、DATA_KEYの値を取得する
        var data = $(this).data(DATA_KEY$6); // configがibjectなら、_configに代入する
        // オブジェクトじゃないならnullを代入する

        var _config = typeof config === 'object' ? config : null; // dataが存在していなくて、disposeとhideがconfigに含まれている場合


        if (!data && /dispose|hide/.test(config)) {
          return;
        } // dataが存在しない場合


        if (!data) {
          // dataをインスタンス化する
          // thisはdata-toggle="popover"を持った要素
          // _configはobjectかnull
          data = new Popover(this, _config); // popover要素にDATA_KEY名でPopoverのインスタンスを設定する

          $(this).data(DATA_KEY$6, data);
        } // dataがあった場合
        // configがstringの場合


        if (typeof config === 'string') {
          // Popoverにconfigと同じ名前のメソッドがあるか判定する
          if (typeof data[config] === 'undefined') {
            // 存在しない場合は、エラー
            throw new TypeError("No method named \"" + config + "\"");
          } // 存在した場合は実行する


          data[config]();
        }
      });
    };

    _createClass(Popover, null, [{
      key: "VERSION",
      // Getters
      get: function get() {
        return VERSION$6;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$4;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME$6;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY$6;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event$6;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY$6;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$4;
      }
    }]);

    return Popover;
  }(Tooltip);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$6] = Popover._jQueryInterface;
  $.fn[NAME$6].Constructor = Popover;

  $.fn[NAME$6].noConflict = function () {
    $.fn[NAME$6] = JQUERY_NO_CONFLICT$6;
    return Popover._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$7 = 'toast';
  var VERSION$7 = '4.4.1';
  var DATA_KEY$7 = 'sc.toast';
  var EVENT_KEY$7 = "." + DATA_KEY$7;
  var JQUERY_NO_CONFLICT$7 = $.fn[NAME$7];
  var Event$7 = {
    CLICK_DISMISS: "click.dismiss" + EVENT_KEY$7,
    HIDE: "hide" + EVENT_KEY$7,
    HIDDEN: "hidden" + EVENT_KEY$7,
    SHOW: "show" + EVENT_KEY$7,
    SHOWN: "shown" + EVENT_KEY$7
  };
  var ClassName$7 = {
    FADE: 'fade',
    HIDE: 'hide',
    SHOW: 'show',
    SHOWING: 'showing'
  };
  var DefaultType$5 = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number'
  };
  var Default$5 = {
    animation: true,
    autohide: true,
    delay: 500
  };
  var Selector$7 = {
    DATA_DISMISS: '[data-dismiss="toast"]'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Toast = /*#__PURE__*/function () {
    // elementはtoast要素
    // configはそれがobjectかのtrueかfalse
    function Toast(element, config) {
      this._element = element;
      this._config = this._getConfig(config);
      this._timeout = null; // toast要素クリック時にdata-dismiss='toast'を持つ要素をhideするイベントを定義

      this._setListeners();
    } // Getters


    var _proto = Toast.prototype;

    // Public
    _proto.show = function show() {
      var _this = this;

      // showイベントを定義
      var showEvent = $.Event(Event$7.SHOW); // showイベントを発動

      $(this._element).trigger(showEvent); // showイベントがブラウザのデフォルト動作を禁止していたら処理終了

      if (showEvent.isDefaultPrevented()) {
        return;
      } // animationがtrueの場合(Defaulrはtrue)


      if (this._config.animation) {
        // toast要素に.fadeを追加
        this._element.classList.add(ClassName$7.FADE);
      } // 処理完了時の関数を定義


      var complete = function complete() {
        // toast要素から.showingを削除
        _this._element.classList.remove(ClassName$7.SHOWING); // .showを付与


        _this._element.classList.add(ClassName$7.SHOW); // shownイベントを実行


        $(_this._element).trigger(Event$7.SHOWN); // autohideがtrueの場合(Defaultはtrue)

        if (_this._config.autohide) {
          // delayだけ送らせてhideを実行(Defaultは500)
          _this._timeout = setTimeout(function () {
            _this.hide();
          }, _this._config.delay);
        }
      }; // .hideを削除


      this._element.classList.remove(ClassName$7.HIDE); // taost要素の高さを取得


      Util.reflow(this._element); // .showingを付与

      this._element.classList.add(ClassName$7.SHOWING); // animetionがtrueの場合


      if (this._config.animation) {
        // toast要素の遷移時間を取得
        var transitionDuration = Util.getTransitionDurationFromElement(this._element); // 遷移時間だけ送らせてcomplete関数を実行

        $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        // animetionがfalseの場合は即実行
        complete();
      }
    };

    _proto.hide = function hide() {
      // toast要素が.showを持っていた場合は処理終了
      if (!this._element.classList.contains(ClassName$7.SHOW)) {
        return;
      } // hideイベントを定義


      var hideEvent = $.Event(Event$7.HIDE); // hideイベントを実行

      $(this._element).trigger(hideEvent); // hideイベントがブラウザの処理を停止していたら処理終了

      if (hideEvent.isDefaultPrevented()) {
        return;
      } // closeを実行


      this._close();
    };

    _proto.dispose = function dispose() {
      // timeoutを削除
      clearTimeout(this._timeout);
      this._timeout = null; // toast要素が.showを持っていたら削除する

      if (this._element.classList.contains(ClassName$7.SHOW)) {
        this._element.classList.remove(ClassName$7.SHOW);
      } // クリック時に非表示にするイベントを削除


      $(this._element).off(Event$7.CLICK_DISMISS); // toast要素を削除する

      $.removeData(this._element, DATA_KEY$7);
      this._element = null;
      this._config = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread2({}, Default$5, {}, $(this._element).data(), {}, typeof config === 'object' && config ? config : {}); // configの値が、DefaultTypeの型と一致しているか確認

      Util.typeCheckConfig(NAME$7, config, this.constructor.DefaultType); // configを返す

      return config;
    };

    _proto._setListeners = function _setListeners() {
      var _this2 = this;

      // toast要素クリック時にdata-dismiss='toast'を持つ要素をhideする
      $(this._element).on(Event$7.CLICK_DISMISS, // click.dismiss
      Selector$7.DATA_DISMISS, // data-dismiss='toast'
      function () {
        return _this2.hide();
      } // hideする
      );
    };

    _proto._close = function _close() {
      var _this3 = this;

      // 関数定義
      var complete = function complete() {
        _this3._element.classList.add(ClassName$7.HIDE); // toast要素に.hideを追加


        $(_this3._element).trigger(Event$7.HIDDEN); // hiddenイベントを実行
      }; // toast要素から.showを削除


      this._element.classList.remove(ClassName$7.SHOW); // animetionがtrueの場合(Defaultはtrue)


      if (this._config.animation) {
        // toast要素の遷移時間を取得
        var transitionDuration = Util.getTransitionDurationFromElement(this._element); // toast要素の遷移時間後に、complete関数を実行

        $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        // animationがfalseならすぐに実行
        complete();
      }
    } // Static
    ;

    Toast._jQueryInterface = function _jQueryInterface(config) {
      // thisはtoast要素
      // configは$('.toast').toast('show')のshow部分
      // toast要素の数だけ処理を行う
      return this.each(function () {
        // toast要素を格納
        var $element = $(this); // toast要素にDATAが設定されているか確認

        var data = $element.data(DATA_KEY$7); // configがobjectか判定してする
        // objectの場合は、objectをそのまま入れる
        // objectじゃない場合は、false

        var _config = typeof config === 'object' && config; // dataが存在していない場合


        if (!data) {
          // toast要素と_configを引数にtoastをインスタンス化する
          // thisはtoast要素
          data = new Toast(this, _config); // toast要素にToastインスタンスを紐付け

          $element.data(DATA_KEY$7, data);
        } // configがstringの場合


        if (typeof config === 'string') {
          // Toastにconfigと同じ名前の引数が存在しない場合はエラー
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          } // Toastのメソッドを実行


          data[config](this);
        }
      });
    };

    _createClass(Toast, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$7;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$5;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$5;
      }
    }]);

    return Toast;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$7] = Toast._jQueryInterface;
  $.fn[NAME$7].Constructor = Toast;

  $.fn[NAME$7].noConflict = function () {
    $.fn[NAME$7] = JQUERY_NO_CONFLICT$7;
    return Toast._jQueryInterface;
  };

  exports.Alert = Alert;
  exports.Button = Button;
  exports.Collapse = Collapse;
  exports.Dropdown = Dropdown;
  exports.Modal = Modal;
  exports.Popover = Popover;
  exports.Toast = Toast;
  exports.Tooltip = Tooltip;
  exports.Util = Util;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=simplicss.bundle.js.map
