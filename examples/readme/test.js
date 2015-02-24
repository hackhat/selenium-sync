// First install deps: `npm install --save-dev selenium-sync fibers`
// Then create a file named `test.js` and paste the following code.
// The run the test with `node test`.

var Future  = require('fibers/future');
var Browser = require('../../src/index').Browser;

// Everything in there is sync with fibers.
Future.task(function(){
    var browser = new Browser();

    // Search on reddit.
    var redditW = browser.getCurrentWindow();
    redditW.goTo('http://www.reddit.com/r/webdev');
    var searchBox = redditW.findEl('#search > input:first-child');
    searchBox.click(); browser.sleep(500);
    redditW.click('#searchexpando > label > input');
    searchBox.sendKeys('hack_hat'); browser.sleep(500);
    redditW.click('#search > input:nth-child(2)'); browser.sleep(500);
    redditW.click('a.author[href="http://www.reddit.com/user/hack_hat"]');
    browser.sleep(2000);

    // Gihub search
    var githubW = browser.openANewWindow('https://github.com/'); browser.sleep(500);
    var searchBox2 = githubW.findEl('.js-site-search-form > input'); browser.sleep(100);
    searchBox2.type('selenium-sync', 'ENTER'); browser.sleep(500);
    githubW.click('a[href="/hackhat/selenium-sync"]'); browser.sleep(500);
    githubW.scrollTo('a[href="#api"]'); browser.sleep(500);
    browser.sleep(2000);

    // Website visit
    var hackhatW = browser.openANewWindow('http://hackhat.com');

    browser.sleep(200000);
}).detach();
