var _       = require('lodash');
var utils   = require('../utils');
var By      = require('selenium-webdriver').By;
var Element = require('./Element');





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



    getUrl: function(){
        this.focus();
        return this.__driver.f_getCurrentUrl().wait();
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



    wait: utils.wait



})





module.exports = Window;
