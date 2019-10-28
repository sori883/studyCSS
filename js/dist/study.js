(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	(global = global || self, factory(global.jQuery));
}(this, function (jquery) { 'use strict';

	jquery = jquery && jquery.hasOwnProperty('default') ? jquery['default'] : jquery;

	var lang = "English";

	var hello = function () {
	  var text;
	  console.log(lang);

	  {
	    text = "Hello";
	  }

	  return function (eve) {
	    window.alert(text);
	    console.log(text); // 引数がない場合の処理

	    if (eve == undefined) {
	      console.log('tinko');
	    }
	  };
	}();

	hello();

}));
//# sourceMappingURL=study.js.map
