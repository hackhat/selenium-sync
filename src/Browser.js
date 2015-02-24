var _             = require('lodash');
var Future        = require('fibers/future');
var ChromeDriver  = require('selenium-webdriver/chrome').Driver;
var EventEmitter  = require('events').EventEmitter;
var until         = require('selenium-webdriver').until;
var TargetLocator = require('selenium-webdriver').WebDriver.TargetLocator;
var Navigation    = require('selenium-webdriver').WebDriver.Navigation;
var WebElement    = require('selenium-webdriver').WebElement;
var By            = require('selenium-webdriver').By;
var utils         = require('./utils');









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




/**
 * # BrowserSync
 * An easy and intuitive way to manage selenium tests with node.js.
 *
 * Intuitive because has simple methods and names you already know and not
 * scriptic names like `getWindowHandles`.
 *
 *
 *
 * ## Why this?
 * While is not yet complete, is more intuitive than every other selenium
 * library for node.js. You have real sync code that can be ran and also
 * a beautiful and intuitive API.
 *
 *
 * ## Features:
 *
 *  - Sync and non blocking using fibers;
 *  - Browser/window/element concepts;
 *  - Easy multi window management;
 *  - Easy css selector out of the box;
 *
 *
 *
 * ## Fiber sync vs promise sync vs blocking sync:
 *
 * The promise sync (the official way to use selenium) is actually fake, it just queue up a
 * lot of instructions to be ran. The downside is that you need to use callback if your next
 * step requires data from a previous step.
 *
 * The blocking sync is actually not that bad, but is blocking your node.js thread, therefore
 * one of the first limitation is that you cannot run your server on the same thread. Is also using
 * a wrapper over the Java selenium implementation instead of the JavaScript code provided by selenium.
 *
 * Fiber sync (this lib) allows you to run non-blocking code while having a real sync environment.
 * Best of both worlds. Uses the JavaScript implementation provided by selenium.
 *
 *
 *
 * ## Sugar code:
 *
 *     var browser = new Browser({
 *         driver: new ChromeDriver(),
 *     })
 *     var currentWindow = browser.getCurrentWindow();
 *     currentWindow.goTo('http://google.com');
 *     currentWindow.refresh();
 *     var searchBoxEl = currentWindow.findEl('#search-box');
 *     searchBoxEl.sendKeys('test');
 *
 *
 *
 * ## More:
 *
 *  - WindowId: this is provided by the webdriver;
 *  - The browser updates every x ms to reflect the reality;
 *
 *
 *
 * ### The bad part:
 *
 *  - You need fibers;
 *  - Is not yet complete;
 */
var Browser = function(options){
    options = _.extend({
        driverType : 'chrome',
        driver     : void 0
    }, options);
    if(options.driver){
        this.__driver  = options.driver;
    }else{
        if(options.driverType === 'chrome'){
            this.__driver = new ChromeDriver();
        }
    }
    this.__windows = [];
    this.__quitted = false;

    // Make it works with fibers.
    utils.wrapMethods(this.__driver, [
        'get'                 ,
        'getTitle'            ,
        'wait'                ,
        'quit'                ,
        'getAllWindowHandles' ,
        'getWindowHandle'     ,
        'executeScript'       ,
        'findElement'         ,
        'findElements'        ,
    ])

    // First update should be run in the current fiber "thread" in order
    // to setup the first window before any other call.
    this.update();

    // The update loop should run in another fiber "thread" to don't
    // block the current one. If not it will not go beyond this step.
    Future.task(function(){
        while(true && !this.__quitted){
            utils.sleep(100).wait();
            this.update();
        }
    }.bind(this)).detach();
}





_.extend(Browser.prototype, EventEmitter.prototype, {



    /**
     * Runs at a certain interval to update this instance
     * with data from the real browser.
     */
    update: function(){
        // Creates missing windows.
        var windowIds = this.getAllWindowIds();
        windowIds.forEach(function(windowId){
            if(this.getWindowById(windowId)) return;
            var w = new Window({
                id      : windowId,
                driver  : this.__driver,
                browser : this,
            });
            this.__addWindow(w)
            console.log('added window ' + w.getId());
        }.bind(this))

        // Closes windows.
        var currentWindowHasBeenClosed = false;
        this.__windows.forEach(function(w){
            var windowNotFoundInDriver = windowIds.indexOf(w.getId()) === -1;
            if(windowNotFoundInDriver){
                if(this.__currentWindow === w){
                    currentWindowHasBeenClosed = true;
                }
                this.__closeWindow(w);
            }
        }.bind(this))

        // Sets current window.
        try{
            var windowId = this.__driver.f_getWindowHandle().wait();
            var w = this.getWindowById(windowId);
            this.__setCurrentWindow(w);
        }catch(err){
            if(err.name === 'NoSuchWindowError'){
                // Ignore this bug. The driver should always return the current active handle,
                // why would you throw an error because the correct active window is closed?
                // If the window is closed, the current active handle should be the parent
                // window or similar.
                console.error(err);
                // It should find a valid window. This is kind of a hack but is the only way
                // I can figure out right now to make it work. This might not be correct because
                // you might have multiple windows and the focus might be on window index 1 instead
                // of 0.
                if(currentWindowHasBeenClosed){
                    if(this.__windows.length === 0){
                        throw new Error('You have closed all windows.');
                    }
                    this.__setCurrentWindow(this.__windows[0]);
                    if(this.__windows.length > 1){
                        throw new Error('Fix this because you might run into issues.');
                    }
                }
            }else{
                throw err;
            }
        }
    },



    /**
     * Always fresh data.
     */
    getCurrentWindow: function(){
        // In order to return the correct window, we need to update.
        this.update();
        return this.__currentWindow;
    },



    getWindowById: function(id){
        var i = this.__windows.length;
        while(i--){
            if(this.__windows[i].getId() === id){
                return this.__windows[i];
            }
        }
        return false;
    },



    getWindowByIndex: function(index){
        return this.__windows[index];
    },



    /**
     * If the window is not yet completely loaded you might not
     * have a valid window title. You should wait for the window
     * to load before using this.
     */
    switchToWindowByTitle: function(title){
        var w = this.getWindowByTitle(title);
        if(w){
            return w.focus();
        }else{
            return false;
        }
    },



    getWindowByTitle: function(title){
        this.update();
        var i = this.__windows.length;
        while(i--){
            if(this.__windows[i].getTitle() === title){
                return this.__windows[i];
            }
        }
        return false;
    },



    switchToWindow: function(w){
        return this.__driver.switchTo().f_window(w.getId()).wait();
    },



    getWindows: function(){
        this.update();
        return this.__windows;
    },



    getAllWindowIds: function(){
        return this.__driver.f_getAllWindowHandles().wait();
    },



    /**
     * Waits until the browser has at least X windows.
     * @param {Number} x Number of windows.
     */
    waitToHaveAtLeastXWindows: function(x){
        this.wait(function(){
            return this.getWindows().length >= x;
        }.bind(this))
    },




    waitWindowToBeClosed: function(w){
        this.wait(function(){
            return w.isClosed();
        }.bind(this))
    },




    waitForWindowWithTitleToOpen: function(title){
        this.wait(function(){
            return !!this.getWindowByTitle(title);
        }.bind(this))
    },



    wait: wait,



    /**
     * Sleeps for x seconds.
     */
    sleep: function(ms){
        utils.sleep(ms).wait();
    },



    /**
     * Closes the browser.
     */
    quit: function(){
        this.__quitted = true;
        return this.__driver.f_quit().wait();
    },



    /**
     * Internal method, don't use externally.
     */
    __setCurrentWindow: function(w){
        if(this.__currentWindow === w) return;
        this.__currentWindow = w;
    },



    /**
     * Internal method, don't use externally.
     */
    __addWindow: function(w){
        this.__windows.push(w);
        this.emit('addWindow', w);
    },



    __closeWindow: function(w){
        this.__windows = _.without(this.__windows, w);
        w.setClosed(true);
        this.emit('closeWindow', w);
    }



})





/**
 * Almost every method makes use of ´this.__browser.switchToWindow(this);`
 * because we need to ensure that the commands are sent to the correct
 * window and not some other window the driver has selected.
 */
var Window = function(options){
    options = _.extend({
        id      : void 0,
        driver  : void 0,
        browser : void 0,
        closed  : false,
    }, options);
    this.__id      = options.id;
    this.__driver  = options.driver;
    this.__browser = options.browser;
    this.__closed  = options.closed;
}





_.extend(Window.prototype, {



    getId: function(){
        return this.__id;
    },



    setClosed: function(value){
        this.__closed = value;
    },



    isClosed: function(){
        return this.__closed;
    },



    /**
     * Goes to a certain url. When ends the page should be loaded already.
     */
    goTo: function(url){
        this.focus();
        return this.__driver.f_get(url).wait();
    },



    /**
     * Will switch to this window and go back to the driver's window.
     */
    getTitle: function(){
        this.focus();
        return this.__driver.f_getTitle().wait();
    },



    /**
     * Returns false if not clicked.
     */
    click: function(cssSelector){
        this.focus();
        var el = this.findEl(cssSelector);
        if(el) return el.click();
        return false;
    },



    /**
     * Finds an element in this window. It will automatically wrap the element
     * returned into a Element of our type.
     */
    findEl: function(cssSelector){
        this.focus();
        try{
            var rawEl = this.__driver.f_findElement(By.css(cssSelector)).wait();
        }catch(err){
            // @todo: this is masking an error.
            console.error(err);
            return void 0;
        }
        var el = new Element({
            rawEl   : rawEl,
            driver  : this.__driver,
            browser : this.__browser,
        })
        return el;
    },



    /**
     * Executes a certain script into this window. You can provide the script
     * as function or as a string. If the current window is not selected in the driver
     * then it will select and then run the script.
     * It will return the output of the script ran in this window.
     *
     * If you want to pass arguments to your function then use the `testArgs` argument.
     * You need EJSON to use this feature for now. @todo: Make EJSON as a plugin.
     *
     *     executeScript(function(data){return data.i;}, {i: 27});
     *     // Will return the value `27`.
     *
     * The main benefit is that you are actually sending a function and not a string
     * which allows you to have syntax highlight in the function you are sending to the
     * client side. Is also more readable than the selenium way.
     */
    executeScript: function(script, testArgs){
        this.focus();
        if(_.isFunction(script)){
            if(testArgs){
                var EJSON = require('EJSON');
                var script = [
                    'return test.runFunctionWithEJSONArgs(',
                        script.toString(), ', ',
                        '\'', EJSON.stringify(testArgs), '\'',
                    ');',
                ].join('');
                console.log('>>>>>>>>>>', script)
            }else{
                script = script.toString();
            }
        }
        try{
            var data = this.__driver.f_executeScript(script).wait();
        }catch(err){
            return {err: err};
        }
        return {data: data};
    },



    waitToLoad: function(){
        this.focus();
        this.wait(function(){
            return this.executeScript('return document.readyState').data === "complete";
        }.bind(this))
    },



    waitForElement: function(cssSelector){
        this.focus();
        this.wait(function(){
            try{
                var el = this.findEl(cssSelector);
            }catch(e){
                console.log(e);
                return false;
            }
            return !!el;
        }.bind(this))
    },



    focus: function(){
        this.__browser.switchToWindow(this);
        return true;
    },



    refresh: function(){
        this.focus();
        this.__driver.navigate().f_refresh().wait();
    },



    back: function(){
        this.focus();
        this.__driver.navigate().f_back().wait();
    },



    forward: function(){
        this.focus();
        this.__driver.navigate().f_forward().wait();
    },



    wait: wait



})




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




module.exports = Browser;
