var utils         = require('./utils');
var TargetLocator = require('selenium-webdriver').WebDriver.TargetLocator;
var Navigation    = require('selenium-webdriver').WebDriver.Navigation;
var WebElement    = require('selenium-webdriver').WebElement;





var seleniumPatches = function(){



    var isPrototype = true;
    utils.wrapMethods(TargetLocator.prototype, [
        'window'
    ], isPrototype);



    var isPrototype = true;
    utils.wrapMethods(WebElement.prototype, [
        'getOuterHtml' ,
        'click'        ,
        'sendKeys'     ,
    ], isPrototype);



    var isPrototype = true;
    utils.wrapMethods(Navigation.prototype, [
        'back'    ,
        'forward' ,
        'refresh' ,
        'to'      ,
    ], isPrototype);



}





module.exports = seleniumPatches;
