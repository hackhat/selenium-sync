var utils         = require('./utils');
var TargetLocator = require('selenium-webdriver').WebDriver.TargetLocator;
var Navigation    = require('selenium-webdriver').WebDriver.Navigation;
var WebElement    = require('selenium-webdriver').WebElement;
var ChromeDriver  = require('selenium-webdriver/chrome').Driver;





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



    var isPrototype = true;
    utils.wrapMethods(ChromeDriver.prototype, [
        'get'                 ,
        'getTitle'            ,
        'getCurrentUrl'       ,
        'wait'                ,
        'quit'                ,
        'getAllWindowHandles' ,
        'getWindowHandle'     ,
        'executeScript'       ,
        'executeAsyncScript'  ,
        'findElement'         ,
        'findElements'        ,
    ], isPrototype);



}





module.exports = seleniumPatches;
