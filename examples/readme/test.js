// First install deps: `npm install --save-dev selenium-sync fibers`

var Future  = require('fibers/future');
var Browser = require('../../src/index').Browser;

// Everything in there is sync with fibers.
Future.task(function(){
    var browser = new Browser();

    // Search on reddit.
    // var redditW = browser.getCurrentWindow();
    // redditW.goTo('http://www.reddit.com/r/webdev');
    // var searchBox = redditW.findEl('#search > input:first-child');
    // searchBox.click();
    // redditW.click('#searchexpando > label > input');
    // searchBox.sendKeys('hack_hat');
    // redditW.click('#search > input:nth-child(2)');
    // browser.sleep(2000);

    // Gihub search
    var githubW = browser.openANewWindow('https://github.com/');
    var searchBox2 = githubW.findEl('.js-site-search-form > input');
    searchBox2.type('selenium-sync', 'ENTER');
    githubW.click('a[href="/hackhat/selenium-sync"]');
    githubW.scrollTo('a[href="#api"]');


    console.log('done!')
    browser.sleep(200000);
}).detach();
