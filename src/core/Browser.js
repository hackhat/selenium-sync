var _               = require('lodash');
var Future          = require('fibers/future');
var ChromeDriver    = require('selenium-webdriver/chrome').Driver;
var EventEmitter    = require('events').EventEmitter;
var webdriver       = require('selenium-webdriver');
var until           = require('selenium-webdriver').until;
var utils           = require('../utils');
var seleniumPatches = require('../seleniumPatches');
var Window          = require('./Window');





var seleniumPatchesApplied = false;
var Browser = function(options){
    if(!seleniumPatchesApplied){
        seleniumPatches();
        seleniumPatchesApplied = true;
    }
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

        // Update each window
        this.__windows.forEach(function(w){
            w.update();
        }.bind(this))
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



    getWindowByUrl: function(url){
        this.update();
        var i = this.__windows.length;
        while(i--){
            if(this.__windows[i].getUrl() === url){
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
     * Might not work correctly if opens a page that will redirect to another
     * url.
     */
    openANewWindow: function(url){
        // Method from: http://stackoverflow.com/questions/17547473/how-to-open-a-new-tab-using-selenium-webdriver
        var w = this.getCurrentWindow();
        var windowName = 'openedWindow_' + this.__openedWindowsId;
        this.__openedWindowsId++;
        w.executeScript("window.open('"+url+"','_blank');");
        this.waitForWindowWithUrlToOpen(url);
        return this.getWindowByUrl(url);
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




    waitForWindowWithUrlToOpen: function(url){
        this.wait(function(){
            return !!this.getWindowByUrl(url);
        }.bind(this))
    },



    wait: utils.wait,



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




module.exports = Browser;
