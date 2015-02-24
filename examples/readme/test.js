// First install deps: `npm install --save-dev selenium-sync fibers`

var Future  = require('fibers/future');
var Browser = require('../../src/index').Browser;

// Everything in there is sync with fibers.
Future.task(function(){
    // Search on reddit.
    var browser = new Browser();
    var redditW = browser.getCurrentWindow();
    redditW.goTo('http://www.reddit.com/r/webdev');
    var searchBox = redditW.findEl('#search > input:first-child');
    searchBox.click();
    redditW.click('#searchexpando > label > input');
    searchBox.sendKeys('hack_hat');
    redditW.click('#search > input:nth-child(2)');
    browser.sleep(2000);

    // Gihub tour
    var githubW = browser.openANewWindow('https://github.com/');
    console.log('done!')
    browser.sleep(200000);
}).detach();
