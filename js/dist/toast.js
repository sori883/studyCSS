(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('./util.js')) :
  typeof define === 'function' && define.amd ? define(['jquery', './util.js'], factory) :
  (global = global || self, global.Toast = factory(global.jQuery, global.Util));
}(this, (function ($, Util) { 'use strict';

  $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
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
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'toast';
  var VERSION = '4.4.1';
  var DATA_KEY = 'sc.toast';
  var EVENT_KEY = "." + DATA_KEY;
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var Event = {
    CLICK_DISMISS: "click.dismiss" + EVENT_KEY,
    HIDE: "hide" + EVENT_KEY,
    HIDDEN: "hidden" + EVENT_KEY,
    SHOW: "show" + EVENT_KEY,
    SHOWN: "shown" + EVENT_KEY
  };
  var ClassName = {
    FADE: 'fade',
    HIDE: 'hide',
    SHOW: 'show',
    SHOWING: 'showing'
  };
  var DefaultType = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number'
  };
  var Default = {
    animation: true,
    autohide: true,
    delay: 500
  };
  var Selector = {
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
      var showEvent = $.Event(Event.SHOW); // showイベントを発動

      $(this._element).trigger(showEvent); // showイベントがブラウザのデフォルト動作を禁止していたら処理終了

      if (showEvent.isDefaultPrevented()) {
        return;
      } // animationがtrueの場合(Defaulrはtrue)


      if (this._config.animation) {
        // toast要素に.fadeを追加
        this._element.classList.add(ClassName.FADE);
      } // 処理完了時の関数を定義


      var complete = function complete() {
        // toast要素から.showingを削除
        _this._element.classList.remove(ClassName.SHOWING); // .showを付与


        _this._element.classList.add(ClassName.SHOW); // shownイベントを実行


        $(_this._element).trigger(Event.SHOWN); // autohideがtrueの場合(Defaultはtrue)

        if (_this._config.autohide) {
          // delayだけ送らせてhideを実行(Defaultは500)
          _this._timeout = setTimeout(function () {
            _this.hide();
          }, _this._config.delay);
        }
      }; // .hideを削除


      this._element.classList.remove(ClassName.HIDE); // taost要素の高さを取得


      Util.reflow(this._element); // .showingを付与

      this._element.classList.add(ClassName.SHOWING); // animetionがtrueの場合


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
      if (!this._element.classList.contains(ClassName.SHOW)) {
        return;
      } // hideイベントを定義


      var hideEvent = $.Event(Event.HIDE); // hideイベントを実行

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

      if (this._element.classList.contains(ClassName.SHOW)) {
        this._element.classList.remove(ClassName.SHOW);
      } // クリック時に非表示にするイベントを削除


      $(this._element).off(Event.CLICK_DISMISS); // toast要素を削除する

      $.removeData(this._element, DATA_KEY);
      this._element = null;
      this._config = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread2({}, Default, {}, $(this._element).data(), {}, typeof config === 'object' && config ? config : {}); // configの値が、DefaultTypeの型と一致しているか確認

      Util.typeCheckConfig(NAME, config, this.constructor.DefaultType); // configを返す

      return config;
    };

    _proto._setListeners = function _setListeners() {
      var _this2 = this;

      // toast要素クリック時にdata-dismiss='toast'を持つ要素をhideする
      $(this._element).on(Event.CLICK_DISMISS, // click.dismiss
      Selector.DATA_DISMISS, // data-dismiss='toast'
      function () {
        return _this2.hide();
      } // hideする
      );
    };

    _proto._close = function _close() {
      var _this3 = this;

      // 関数定義
      var complete = function complete() {
        _this3._element.classList.add(ClassName.HIDE); // toast要素に.hideを追加


        $(_this3._element).trigger(Event.HIDDEN); // hiddenイベントを実行
      }; // toast要素から.showを削除


      this._element.classList.remove(ClassName.SHOW); // animetionがtrueの場合(Defaultはtrue)


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

        var data = $element.data(DATA_KEY); // configがobjectか判定してする
        // objectの場合は、objectをそのまま入れる
        // objectじゃない場合は、false

        var _config = typeof config === 'object' && config; // dataが存在していない場合


        if (!data) {
          // toast要素と_configを引数にtoastをインスタンス化する
          // thisはtoast要素
          data = new Toast(this, _config); // toast要素にToastインスタンスを紐付け

          $element.data(DATA_KEY, data);
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
        return VERSION;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }]);

    return Toast;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME] = Toast._jQueryInterface;
  $.fn[NAME].Constructor = Toast;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Toast._jQueryInterface;
  };

  return Toast;

})));
//# sourceMappingURL=toast.js.map
