/**
 * @class index
 * @type {Object}
 * This is what the main module returns when you do
 *
 *     var seleniumSync = require('selenium-sync');
 */
module.exports = {
    /**
     * @type {core.Browser}
     */
    Browser           : require('./core/Browser'),
    /**
     * @type {core.Window}
     */
    Window            : require('./core/Window'),
    /**
     * @type {core.Element}
     */
    Element           : require('./core/Element'),
    /**
     * @type {utils}
     */
    utils             : require('./utils'),
    /**
     * @type {selenium-webdriver}
     */
    seleniumWebdriver : require('selenium-webdriver'),
}
