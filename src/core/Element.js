var _            = require('lodash');
var utils        = require('../utils');
var SeleniumKeys = require('selenium-webdriver').Key;





/**
 * Element
 */
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




Element.Keys = SeleniumKeys;





_.extend(Element.prototype, {



    /**
     * Send keys to the element. If you want to send special keys like enter you should do like this
     *
     *     el.type('my keyword', 'ENTER');
     */
    type: function(keys){
        var args = Array.prototype.slice.call(arguments);
        args.forEach(function(stringKeyArg, i){
            _.forEach(Element.Keys, function(seleniumKey, stringKey){
                if(stringKeyArg === stringKey){
                    args[i] = seleniumKey;
                }
            })
        })
        this.sendKeys.apply(this, args);
    },



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
