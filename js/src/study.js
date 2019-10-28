import $ from 'jquery'

const NAME = 'study'

class Study {
  constructor(target) {
    this.element = target
  }

  out() {
    return this.element;
  }
}

let study = new Study()
console.log(study.out())


$.fn[NAME] = function() {
  this.css( "background-color", "green" );
  return this;
};

export default Study
