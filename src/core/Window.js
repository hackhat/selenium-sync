var _       = require('lodash');
var utils   = require('../utils');
var By      = require('selenium-webdriver').By;
var Element = require('./Element');





/**
 * @class core.Window
 *
 * Almost every method makes use of ´this.__browser.switchToWindow(this);`
 * because we need to ensure that the commands are sent to the correct
 * window and not some other window the driver has selected.
 *
 * @param {Object}       options
 * @param {String}       options.id The id provided by selenium webdriver.
 * @param {*}            options.driver The selenium webdriver.
 * @param {core.Browser} options.browser
 */
var Window = function(options){
    options = _.extend({
        id      : void 0,
        driver  : void 0,
        browser : void 0,
    }, options);
    this.__id      = options.id;
    this.__driver  = options.driver;
    this.__browser = options.browser;
    this.__closed  = false;
}





/**
 * Scripts that will be ran on the client side.
 * @property scripts
 * @static
 */
Window.scripts = {



    /**
     * Setups the window
     * @method scripts.setup
     * @static
     */
    setup: function(){
        if(typeof window.test === 'undefined'){
            window.test = {};
        }
        if(!window.test.runFunctionWithJSONArgs){
            window.test.runFunctionWithJSONArgs = function(fn, data){
                fn.call(window, JSON.parse(data));
            }
        }


        return true;
    },



    // loadScript: function(){
    //     // From: http://sqa.stackexchange.com/questions/2921/webdriver-can-i-inject-a-jquery-script-for-a-page-that-isnt-using-jquery
    // },



    /**
     * Scrolls to a certain element.
     * @method scripts.scrollTo
     * @param {String} cssSelector
     */
    scrollTo: function(cssSelector){
        var target = document.querySelector(cssSelector);
        if(!target) return alert('not found');
        $(window).scrollTop(target.getBoundingClientRect().top);
        return true;
    }



}





_.extend(Window.prototype, {



    /**
     * Update, not yet used. Called automatically by the browser.
     */
    update: function(){

    },



    /**
     * Returns the id of the window. This is the id provided by the
     * selenium webdriver.
     * @return {String} Id of this window.
     */
    getId: function(){
        return this.__id;
    },



    /**
     * Defines that this window is now closed.
     * Should not be called.
     */
    setClosed: function(value){
        this.__closed = value;
    },



    /**
     * Queries whenever this window is closed or not.
     * @return {Boolean} True if the window is closed. False if is still open.
     */
    isClosed: function(){
        return this.__closed;
    },



    /**
     * Goes to a certain url. When ends the page should be loaded already.
     * @param {String} url
     */
    goTo: function(url){
        this.focus();
        return this.__driver.f_get(url).wait();
    },



    /**
     * Returns the title of the window.
     * @return {String} Title of the window.
     */
    getTitle: function(){
        this.focus();
        return this.__driver.f_getTitle().wait();
    },



    /**
     * Returns the url of the window.
     * @return {String} Url of the window.
     */
    getUrl: function(){
        this.focus();
        return this.__driver.f_getCurrentUrl().wait();
    },





    /**
     * Returns false if the element have not been clicked.
     * @param {String} cssSelector
     * @return {Boolean}
     */
    click: function(cssSelector){
        this.focus();
        var el = this.findEl(cssSelector);
        if(el) return el.click();
        return false;
    },



    /**
     * Scrolls into an element defined by the cssSelector.
     * @param {String} cssSelector
     */
    scrollTo: function(cssSelector){
        this.executeScript(Window.scripts.scrollTo, cssSelector);
    },



    /**
     * Finds an element in this window. It will automatically wrap the element
     * returned into a Element of our type.
     * @param {String} cssSelector
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
     *
     * @param {String|Function} script
     * @param {*} testArgs
     * @return {Object} return
     * @return {*} return.data
     * @return {String|undefined} return.err
     */
    executeScript: function(script, testArgs){
        this.focus();
        this.__injectInitScripts();
        if(_.isFunction(script)){
            if(testArgs){
                var hasEJSON = this.__hasEJSON();
                var clientSideFunction = hasEJSON ? 'runFunctionWithEJSONArgs' : 'runFunctionWithJSONArgs';
                var stringArgs;
                console.log('hasEJSON', hasEJSON)
                if(hasEJSON){
                    var EJSON = require('EJSON');
                    stringArgs = EJSON.stringify(testArgs);
                }else{
                    stringArgs = JSON.stringify(JSON.stringify(testArgs));
                }
                var script = [
                    'return test.'+clientSideFunction+'(',
                        script.toString(), ', ',
                        // The double stringify is needed because we need to pass the
                        // arguments as string, but that string should be stringified too.
                        // This enables you to send picky data like `a[href="xxx"]`.
                        '', stringArgs, '',
                    ');',
                ].join('');
            }else{
                script = script.toString();
            }
        }
        return this.executeRawScript(script);
    },



    /**
     * Executes a raw script without any helpers. Then returns the
     * data.
     *
     * Important to note that the return value is not the data, is an object
     * which contains the data and an eventual error.
     *
     * Example of an output of this function:
     *
     *     {err: 'some error happened'}
     *
     * or
     *
     *     {data: 5}
     */
    executeRawScript: function(script){
        this.focus();
        if(_.isFunction(script)){
            script = script.toString();
            var script = ['(', script.toString(), ')();'].join('');
        }
        try{
            var data = this.__driver.f_executeScript(script).wait();
        }catch(err){
            return {err: err};
        }
        return {data: data};
    },



    /**
     * Waits until this window has loaded.
     */
    waitToLoad: function(){
        this.focus();
        this.wait(function(){
            return this.isLoaded();
        }.bind(this))
    },



    /**
     * Returns true if the page has been loaded.
     * @return {Boolean} Page is loaded.
     */
    isLoaded: function(){
        return this.executeScript('return document.readyState').data === "complete";
    },



    /**
     * Waits until at least one element is found.
     * @param {String} cssSelector
     */
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



    /**
     * Focus on this window.
     */
    focus: function(){
        this.__browser.switchToWindow(this);
        return true;
    },



    /**
     * Refreshes this window.
     */
    refresh: function(){
        this.focus();
        this.__driver.navigate().f_refresh().wait();
    },



    /**
     * Navigates back once.
     */
    back: function(){
        this.focus();
        this.__driver.navigate().f_back().wait();
    },



    /**
     * Navigates forward.
     */
    forward: function(){
        this.focus();
        this.__driver.navigate().f_forward().wait();
    },



    /**
     * Check the {@link utils#wait} docs.
     * @method
     */
    wait: utils.wait,



    /**
     * Scripts should be injected before each executeAction because
     * the page might have been reloaded from the last time the scripts
     * have been injected and might not be available.
     * There is no problem if is executed more than once on the same page.
     * @private
     */
    __injectInitScripts: function(){
        this.executeRawScript(Window.scripts.setup)
    },



    __hasEJSON: function(){
        return this.executeRawScript('return !!test.EJSON;').data;
    }



})





module.exports = Window;
