(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.simplicss = {}));
}(this, function (exports) { 'use strict';

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.3.1): alert.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'alert';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Alert = function Alert(element) {
    console.log(element);
  };

  exports.Alert = Alert;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=simplicss.bundle.js.map
