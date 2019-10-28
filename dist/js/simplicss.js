(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
  typeof define === 'function' && define.amd ? define(['exports', 'jquery'], factory) :
  (global = global || self, factory(global.simplicss = {}, global.jQuery));
}(this, function (exports, $) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

  var NAME = 'study';

  var Study =
  /*#__PURE__*/
  function () {
    function Study(target) {
      this.element = target;
    }

    var _proto = Study.prototype;

    _proto.out = function out() {
      return this.element;
    };

    return Study;
  }();

  var study = new Study();
  console.log(study.out());

  $.fn[NAME] = function () {
    this.css("background-color", "green");
    return this;
  };

  exports.Study = Study;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=simplicss.js.map
