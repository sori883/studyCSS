(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('./util.js')) :
  typeof define === 'function' && define.amd ? define(['jquery', './util.js'], factory) :
  (global = global || self, global.Collapse = factory(global.jQuery, global.Util));
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

  var NAME = 'collapse';
  var VERSION = '4.4.1';
  var DATA_KEY = 'sc.collapse';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var Default = {
    toggle: true,
    parent: ''
  };
  var DefaultType = {
    toggle: 'boolean',
    parent: '(string|element)'
  };
  var Event = {
    SHOW: "show" + EVENT_KEY,
    SHOWN: "shown" + EVENT_KEY,
    HIDE: "hide" + EVENT_KEY,
    HIDDEN: "hidden" + EVENT_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
  };
  var ClassName = {
    SHOW: 'show',
    COLLAPSE: 'collapse',
    COLLAPSING: 'collapsing',
    COLLAPSED: 'collapsed'
  };
  var Dimension = {
    WIDTH: 'width',
    HEIGHT: 'height'
  };
  var Selector = {
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

      var toggleList = [].slice.call(document.querySelectorAll(Selector.DATA_TOGGLE)); // 取得した[data-toggle="collapse"]を持つ要素の数だけループする

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
      if ($(this._element).hasClass(ClassName.SHOW)) {
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
      if (this._isTransitioning || $(this._element).hasClass(ClassName.SHOW)) {
        return;
      }

      var actives;
      var activesData; // this._parentが存在していたら

      if (this._parent) {
        // parentから.showか.collapsingを持つ要素を取得する
        actives = [].slice.call(this._parent.querySelectorAll(Selector.ACTIVES)).filter(function (elem) {
          // this._config.parent要素がstringの場合
          if (typeof _this._config.parent === 'string') {
            // .activesの要素でdata-parent属性がthis._config.parentもののみを取得
            return elem.getAttribute('data-parent') === _this._config.parent;
          } // this._config.parent要素がstring以外の場合
          // elemのクラスリストにcollapseが存在するもののみを取得


          return elem.classList.contains(ClassName.COLLAPSE);
        }); // activesに要素が存在していない場合は、nullを代入する

        if (actives.length === 0) {
          actives = null;
        }
      } // activesがnullじゃない場合


      if (actives) {
        // activesからクリックされたtrigger要素のhrefで指定された要素を削除
        // 削除後に残ったactivesからDATA_KEYの値を取得する
        activesData = $(actives).not(this._selector).data(DATA_KEY); // activesDataが存在していて、activesData._isTransitioningがtrueなら
        // 処理終了

        if (activesData && activesData._isTransitioning) {
          return;
        }
      } // showイベントを定義


      var startEvent = $.Event(Event.SHOW); // showイベントを発動

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
          $(actives).data(DATA_KEY, null);
        }
      } // this._elementが.widthを持っていたらwidthを取得
      // もっていなかったらheightを取得


      var dimension = this._getDimension(); // this._element(開閉される要素)から.collapseを削除
      // そして、.collapsingを付与


      $(this._element).removeClass(ClassName.COLLAPSE).addClass(ClassName.COLLAPSING); // 開閉対象の高さを0pxにする

      this._element.style[dimension] = 0; // [data-toggle="collapse"]を持つ要素が0じゃない場合

      if (this._triggerArray.length) {
        // _triggerArrayの.collapsedを削除
        // aria-expandedをtrueで設定
        $(this._triggerArray).removeClass(ClassName.COLLAPSED).attr('aria-expanded', true);
      } // this._isTransitioningにtrueを設定


      this.setTransitioning(true);

      var complete = function complete() {
        // ここでshowをしている。詳細は_transitions.scssを確認だけど
        // 単純に.showを持っていない.collapse要素はdisplay:none;している
        // .collapsingを削除し、.collapseと.showを付与
        $(_this._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).addClass(ClassName.SHOW); // 0に設定したstyleを空にする

        _this._element.style[dimension] = ''; // this._isTransitioningにfalseを設定

        _this.setTransitioning(false); // shownイベントを発動


        $(_this._element).trigger(Event.SHOWN);
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
      if (this._isTransitioning || !$(this._element).hasClass(ClassName.SHOW)) {
        return;
      } // hideイベントを定義する


      var startEvent = $.Event(Event.HIDE); // hideイベントを発動する

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

      $(this._element).addClass(ClassName.COLLAPSING).removeClass(ClassName.COLLAPSE).removeClass(ClassName.SHOW); // trigger要素の長さを取得

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

            if (!$elem.hasClass(ClassName.SHOW)) {
              // trrigerに.collapsedを追加する
              $(trigger).addClass(ClassName.COLLAPSED) // aria-expanded属性をfalseにする
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


        $(_this2._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).trigger(Event.HIDDEN);
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
      $.removeData(this._element, DATA_KEY); // 各要素にnullを代入して削除

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

      Util.typeCheckConfig(NAME, config, DefaultType); // configを返す

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
      var isOpen = $(element).hasClass(ClassName.SHOW); // triggerArrayに要素が入っているか判定

      if (triggerArray.length) {
        // elementがshowを持っていた場合は.collapsedを削除
        // elementがshowを持っていない場合は.collapsedを付与
        // aria-expanded属性にisOpenの値を設定
        $(triggerArray).toggleClass(ClassName.COLLAPSED, !isOpen).attr('aria-expanded', isOpen);
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

        var data = $this.data(DATA_KEY); // configを格納

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
          $this.data(DATA_KEY, data);
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
        return VERSION;
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


  $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
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

      var data = $target.data(DATA_KEY); // configとdataが一致していたら$trigger.data()を入れる
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

  $.fn[NAME] = Collapse._jQueryInterface;
  $.fn[NAME].Constructor = Collapse;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Collapse._jQueryInterface;
  };

  return Collapse;

})));
//# sourceMappingURL=collapse.js.map
