(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('./util.js')) :
  typeof define === 'function' && define.amd ? define(['jquery', './util.js'], factory) :
  (global = global || self, global.Tab = factory(global.jQuery, global.Util));
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

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'tab';
  var VERSION = '4.4.1';
  var DATA_KEY = 'sc.tab';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var EVENT_HIDE = "hide" + EVENT_KEY;
  var EVENT_HIDDEN = "hidden" + EVENT_KEY;
  var EVENT_SHOW = "show" + EVENT_KEY;
  var EVENT_SHOWN = "shown" + EVENT_KEY;
  var EVENT_CLICK_DATA_API = "click" + EVENT_KEY + DATA_API_KEY;
  var CLASS_NAME_DROPDOWN_MENU = 'dropdown-menu';
  var CLASS_NAME_ACTIVE = 'active';
  var CLASS_NAME_DISABLED = 'disabled';
  var CLASS_NAME_FADE = 'fade';
  var CLASS_NAME_SHOW = 'show';
  var SELECTOR_DROPDOWN = '.dropdown';
  var SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
  var SELECTOR_ACTIVE = '.active';
  var SELECTOR_ACTIVE_UL = '> li > .active';
  var SELECTOR_DATA_TOGGLE = '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]';
  var SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
  var SELECTOR_DROPDOWN_ACTIVE_CHILD = '> .dropdown-menu .active';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Tab = /*#__PURE__*/function () {
    function Tab(element) {
      // this.elementにクリックされた要素を格納する
      this._element = element;
    } // Getters


    var _proto = Tab.prototype;

    // Public
    // tab-contents > tab-paneがdisplay:none;にしている
    // tab-cotents > activeを付与されるとdisplay:block;になる
    _proto.show = function show() {
      var _this = this;

      // クリックされた要素にparentNodeが存在しているかつ、
      // そのparentNodeがエレメントでかつ
      // .activeまたは、.disableを持っている場合
      if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && $(this._element).hasClass(CLASS_NAME_ACTIVE) || $(this._element).hasClass(CLASS_NAME_DISABLED)) {
        // 処理を終了させる
        return;
      }

      var target;
      var previous; // クリックされた要素近くの.list-groupの中から.navを取得する
      // 0番目はElement

      var listElement = $(this._element).closest(SELECTOR_NAV_LIST_GROUP)[0]; // クリックされた要素のhrefで指定されている値を取得

      var selector = Util.getSelectorFromElement(this._element); // listElementが存在した場合

      if (listElement) {
        // listElementのnodeNameがULまたは、OLの場合は、> li > .activeを入れる。そうじゃない場合は.activeをセレクタにする
        var itemSelector = listElement === 'UL' || listElement.nodeName === 'OL' ? SELECTOR_ACTIVE_UL : SELECTOR_ACTIVE; // クリックしたlist-groupから、.activeな要素を取得して、配列で格納する

        previous = $.makeArray($(listElement).find(itemSelector)); // 配列の0番目(.activeな要素)を取得

        previous = previous[previous.length - 1];
      } // hideイベントを定義する


      var hideEvent = $.Event(EVENT_HIDE, {
        relatedTarget: this._element // クリックされた要素

      }); // showイベントを定義する

      var showEvent = $.Event(EVENT_SHOW, {
        relatedTarget: previous // activeな要素

      }); // activeな要素が存在したら、hideイベントを実行する

      if (previous) {
        $(previous).trigger(hideEvent);
      } // クリックされた要素に対して、showイベントを発動


      $(this._element).trigger(showEvent);

      if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
        // showまたはhideイベントがブラウザの動作を停止していた場合は、処理終了
        return;
      } // selectorが存在していたら


      if (selector) {
        // selectorで指定されているtarget要素を取得
        target = document.querySelector(selector);
      } // (1)現在.active要素から.activeを削除
      // (2)クリックされた要素に.activeを付与


      this._activate(this._element, // クリックされた要素
      listElement // クリックされた要素のULエレメント
      ); // complete関数を定義


      var complete = function complete() {
        // hiddenイベントを定義
        var hiddenEvent = $.Event(EVENT_HIDDEN, {
          relatedTarget: _this._element // クリックされた要素

        });
        var shownEvent = $.Event(EVENT_SHOWN, {
          relatedTarget: previous // クリックされた段階で、activeな要素

        }); // クリックされた段階で.activeな要素にはhiddenイベントを実行

        $(previous).trigger(hiddenEvent); // クリックされた要素にはshownイベントを実行

        $(_this._element).trigger(shownEvent);
      }; // target要素(selectorで指定されている、タブで切り替わる要素)


      if (target) {
        // targetが存在していたら TODO
        this._activate(target, target.parentNode, complete);
      } else {
        // targetが存在しない場合はcomplite関数を実行
        complete();
      }
    };

    _proto.dispose = function dispose() {
      // this._elementのDATA_KEYを削除
      $.removeData(this._element, DATA_KEY); // this._elementをnullにする

      this._element = null;
    } // Private
    // showから2回実行される
    // 1回目はcallbackがないので(1)と(2)をやる
    // (1)現在.active要素から.activeを削除
    // (2)クリックされた要素に.activeを付与
    ;

    _proto._activate = function _activate(element, container, callback) {
      var _this2 = this;

      // 1回目の引数
      // elementはクリックされた要素
      // containerはelementの親要素(UL)
      // 2回目の引数
      // elementはtarget要素(selectorで指定されている、タブで切り替わる要素)
      // containerはtargetの親要素
      // callbackはhiddenとshownイベントを実行するcomplete関数
      // containerが存在していて、ULまたはOL要素だった場合(1回目)はactiveなselectorをULかOLから取得
      // falseの場合は、親要素からactiveな要素を取得(ULとOL以外の1回目か、2回目(activeなtargetの取得))
      var activeElements = container && (container.nodeName === 'UL' || container.nodeName === 'OL') ? $(container).find(SELECTOR_ACTIVE_UL) // > li > .activeのselctorを使ってcontainer要素からactive要素を取得する
      : $(container).children(SELECTOR_ACTIVE); // ULまたはOL要素じゃない場合は、container要素からただ.activeを取得する
      // active要素を取得

      var active = activeElements[0]; // callbackがあるかつ、activeが存在していて.fadeを持っている場合
      // 1回目はundefined(callbackないから)、2回目はfadeを持ってたらtrue

      var isTransitioning = callback && active && $(active).hasClass(CLASS_NAME_FADE); // completeに_trantitionCompleteを入れる

      var complete = function complete() {
        return _this2._transitionComplete(element, active, callback);
      }; // activeが存在していて、activeが.fadeを持っていた場合


      if (active && isTransitioning) {
        // active要素の遷移時間を取得
        var transitionDuration = Util.getTransitionDurationFromElement(active); // active要素から、.showを削除し、complete(_trantsitionComplete)を実行

        $(active).removeClass(CLASS_NAME_SHOW).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        // falseの場合は、そのまま実行
        // クリックされたselector要素はcallbackがないのでtransitionしない
        complete();
      }
    } // showで2回実行される
    // 1回目は(1)と(2)、
    // (1)現在.active要素から.activeを削除
    // (2)クリックされた要素に.activeを付与
    ;

    _proto._transitionComplete = function _transitionComplete(element, active, callback) {
      // 1回目の引数は以下
      // elementはクリックされた要素
      // activeはクリックする前のactiveな要素
      // 2回目の引数は以下
      // elementはtarget要素(クリックしたselectorで指定されている、タブで切り替わる要素)
      // activeはクリックされた時点でactiveな親要素
      // callbackはhiddenとshownイベントを実行するcomplete関数
      // activeが存在した場合
      if (active) {
        // .activeを削除
        $(active).removeClass(CLASS_NAME_ACTIVE); // .activeの親要素から、.dropdown-menu .active要素を取得する

        var dropdownChild = $(active.parentNode).find(SELECTOR_DROPDOWN_ACTIVE_CHILD)[0]; // dropdownChildが存在する場合

        if (dropdownChild) {
          // .activeを削除する
          $(dropdownChild).removeClass(CLASS_NAME_ACTIVE);
        } // active要素のrole属性がtabの場合


        if (active.getAttribute('role') === 'tab') {
          // aria-selectedをfalseにする
          active.setAttribute('aria-selected', false);
        }
      } // elementに.activeを付与する


      $(element).addClass(CLASS_NAME_ACTIVE); // elementのroleがtabの場合

      if (element.getAttribute('role') === 'tab') {
        // aria-selectedをtrueにする
        element.setAttribute('aria-selected', true);
      } // element要素の高さ取得する


      Util.reflow(element); // elementが.fadeを持っていた場合

      if (element.classList.contains(CLASS_NAME_FADE)) {
        // .showを追加する
        // .fadeに.showが付与されてないとopacity:0;になってるから
        // tab-contents自体は.activeを付与された時点でdisplay:block;になる
        element.classList.add(CLASS_NAME_SHOW);
      } // elemntに親要素が存在していて、その親要素が.dropdown-menuを持っていた場合
      // つまり、.dropdown-itemをクリックしたとき


      if (element.parentNode && $(element.parentNode).hasClass(CLASS_NAME_DROPDOWN_MENU)) {
        // ,dropdown-menuの親要素から.dropdown要素を取得する
        var dropdownElement = $(element).closest(SELECTOR_DROPDOWN)[0]; // .dropdown要素が存在した場合

        if (dropdownElement) {
          // 取得した.dropdown要素から、.dropdown-toggle要素を取得する
          var dropdownToggleList = [].slice.call(dropdownElement.querySelectorAll(SELECTOR_DROPDOWN_TOGGLE)); // .dropdown-toggle要素に.activeを追加する

          $(dropdownToggleList).addClass(CLASS_NAME_ACTIVE);
        } // elementにaria-expanded属性をtrueで付与する


        element.setAttribute('aria-expanded', true);
      } // callback関数がある場合は実行する


      if (callback) {
        callback();
      }
    } // Static
    ;

    Tab._jQueryInterface = function _jQueryInterface(config) {
      // configはshow
      // classList.containsするときに.get(0)いらないのは、ここでeachしてるからみたい
      return this.each(function () {
        // クリックされた要素
        var $this = $(this); // クリックされた要素から、DATA_KEYを取得

        var data = $this.data(DATA_KEY); // dataが存在していない場合

        if (!data) {
          // Tabをインストタンス化
          // 引数はクリックされた要素
          data = new Tab(this); // クリックされた要素に対してTabのインスタンスを設定

          $this.data(DATA_KEY, data);
        } // configがstringの場合


        if (typeof config === 'string') {
          // Tabにconfigと同じ関数があるか判定
          if (typeof data[config] === 'undefined') {
            // なかったらエラー
            throw new TypeError("No method named \"" + config + "\"");
          } // あったら実行


          data[config]();
        }
      });
    };

    _createClass(Tab, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);

    return Tab;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */
  // [data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]に対してクリックイベントを定義


  $(document).on(EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
    // ブラウザのデフォルト動作を停止する
    event.preventDefault(); // showを引数に、jQueryInterfaceを発動する

    Tab._jQueryInterface.call($(this), 'show');
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Tab._jQueryInterface;
  $.fn[NAME].Constructor = Tab;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Tab._jQueryInterface;
  };

  return Tab;

})));
//# sourceMappingURL=tab.js.map
