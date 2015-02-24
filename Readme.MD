# selenium-sync

An easy and intuitive way to manage selenium tests with node.js.
Intuitive because has simple methods and names you already know and not
scriptic names like `getWindowHandles`.



## Install

    npm install selenium-sync --save-dev



## Why this?

While is not yet complete, is more intuitive than every other selenium
library for node.js. You have real sync code that can be ran and also
a beautiful and intuitive API.



## Features

 - Sync and non blocking using fibers;
 - Browser/window/element concepts;
 - Easy multi window management;
 - Easy css selector out of the box;



## Fiber sync vs promise sync vs blocking sync

[**Promise sync**](https://code.google.com/p/selenium/wiki/WebDriverJs) (the official way to use selenium) is actually fake, it just queue up a lot of instructions to be ran. The downside is that you need to use callback if your next step requires data from a previous step. 

[**Blocking sync**](https://github.com/jsdevel/webdriver-sync) is actually not that bad, but is blocking your node.js thread, therefore one of the first limitation is that you cannot run your server on the same thread. Is also using a wrapper over the Java selenium implementation instead of the JavaScript code provided by selenium.

[**Fiber sync**](https://github.com/hackhat/selenium-sync) (this library) allows you to run non-blocking code while having a real sync environment. Best of both worlds. Uses the JavaScript implementation provided by selenium and [fibers](https://github.com/laverdet/node-fibers) to make it sync.



## Sugar code

    var browser = new Browser({
        driver: new ChromeDriver(),
    })
    var currentWindow = browser.getCurrentWindow();
    currentWindow.goTo('http://google.com');
    currentWindow.refresh();
    var searchBoxEl = currentWindow.findEl('#search-box');
    searchBoxEl.sendKeys('test');



## More you should know

 - WindowId: this is provided by the webdriver;
 - The browser updates every x ms to reflect the reality;



### The bad part

 - Is not yet complete;
