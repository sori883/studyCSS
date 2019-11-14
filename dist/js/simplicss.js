(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
  typeof define === 'function' && define.amd ? define(['exports', 'jquery'], factory) :
  (global = global || self, factory(global.simplicss = {}, global.jQuery));
}(this, function (exports, $) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

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
    isElement: function isElement(obj) {
      return (obj[0] || obj).nodeType;
    },
    typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
      for (var property in configTypes) {
        if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
          var expectedTypes = configTypes[property];
          var value = config[property];
          var valueType = value && Util.isElement(value) ? 'element' : toType(value);

          if (!new RegExp(expectedTypes).test(valueType)) {
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

  exports.Alert = Alert;
  exports.Util = Util;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=simplicss.js.map
