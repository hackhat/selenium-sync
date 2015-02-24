var _     = require('lodash');
var utils = require('../utils');





var Element = function(options){
    options = _.extend({
        rawEl   : void 0,
        driver  : void 0,
        browser : void 0,
    }, options);
    this.__rawEl   = options.rawEl;
    this.__driver  = options.driver;
    this.__browser = options.browser;
}





_.extend(Element.prototype, {


});
// Create sync aliases automatically for the methods requested.
// Will be added o the Element.prototype;
[
    'click',
    'sendKeys',
].forEach(function(methodName){
    Element.prototype[methodName] = function(){
        return this.__rawEl['f_' + methodName].apply(this.__rawEl, arguments).wait();
    }
})




module.exports = Element;
