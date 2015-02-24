var _      = require('lodash');
var Future = require('fibers/future');




/**
 * @class utils
 * @type {Object}
 * @private
 */
var utils = {};



utils.wrapPromise = function(fn, target, multi, isPrototype){
    return Future.wrap(function(){
        var args = Array.prototype.slice.call(arguments);
        var cb   = args.pop();
        /**
         * If you don't want to bind on target, such as prototype binding then
         * set it to true to bind to this. This will be the instance of the target
         * because is on it's prototype.
         */
        fn.apply(isPrototype ? this : target, args).then(function onSuccess(){
            var args = Array.prototype.slice.call(arguments);
            args.unshift(void 0);
            cb.apply({}, args);
        }, function onError(err){
            cb(err);
        })
    }, !!multi);
}



utils.wrapMethods = function(target, methods, isPrototype){
    var multi = false;
    methods.forEach(function(methodName){
        if(target['f_' + methodName] !== void 0) throw new Error('Target already has this method');
        if(!_.isFunction(target[methodName])) throw new Error('"' + methodName + '"' + ' Is not a function');
        target['f_' + methodName] = utils.wrapPromise(target[methodName], target, multi, isPrototype);
    })
}



utils.sleep = function(ms){
    var future = new Future;
    setTimeout(function() {
        future.return();
    }, ms);
    return future;
}



/**
 * @method wait
 * A helper method that receives a function.
 * The function should return false to keep waiting, any other value
 * will stop the wait.
 * The function provided will be called multiple times until it returns
 * true.
 */
utils.wait = function(fn){
    var i = 0;
    while(fn(i) === false){
        i++;
        utils.sleep(200).wait();
    }
};





module.exports = utils;
