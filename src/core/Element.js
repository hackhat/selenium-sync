var _            = require('lodash');
var utils        = require('../utils');
var SeleniumKeys = require('selenium-webdriver').Key;





/**
 * @class core.Element
 * @param {Object}       options
 * @param {*}            options.rawEl The selenium webdriver element.
 * @param {*}            options.driver The selenium webdriver.
 * @param {core.Browser} options.browser
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





_.extend(Element.prototype, {



    /**
     * Send keys to the element. If you want to send special keys like enter you should do like this
     *
     *     el.type('my keyword', 'ENTER');
     *
     * @note Is not just an alias of `sendKeys`, but does more.
     */
    type: function(keys){
        var args = Array.prototype.slice.call(arguments);
        args.forEach(function(stringKeyArg, i){
            _.forEach(SeleniumKeys, function(seleniumKey, stringKey){
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
    /**
     * @method click
     */
    'click',
    /**
     * @method sendKeys
     */
    'sendKeys',
].forEach(function(methodName){
    Element.prototype[methodName] = function(){
        return this.__rawEl['f_' + methodName].apply(this.__rawEl, arguments).wait();
    }
})




module.exports = Element;
