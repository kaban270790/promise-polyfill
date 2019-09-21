(function () {
    /**
     * @returns {Window | WorkerGlobalScope | NodeJS.Global}
     */
    const getGlobalNS = function () {
        if ("undefined" !== typeof self) {
            return self;
        } else if ("undefined" !== typeof window) {
            return window;
        } else if ("undefined" !== typeof global) {
            return global;
        }
        throw new Error("unable to locate global object");
    };
    const STATE_PENDING = 0;
    const STATE_RESOLVE = 1;
    const STATE_REJECTED = 2;
    const STATE_COMPLETED = 3;
    /**
     *
     * @param {MyPromise} promise
     * @param {Function} userResolve
     * @param {Function} userRejected
     * @constructor
     */
    const Handler = function (promise, userResolve, userRejected) {
        this.promise = promise;
        this.userResolve = userResolve;
        this.userRejected = userRejected;
    };
    /**
     * @param {MyPromise} promise
     * @param {Handler} handler
     */
    const handle = function (promise, handler) {
        while (promise.state === STATE_COMPLETED) {
            promise = promise.value;
        }
        if (promise.state === STATE_PENDING) {
            promise.handlers.push(handler);
            return;
        }
        let callback;
        if (promise.state === STATE_RESOLVE) {
            callback = handler.userResolve;
        } else {
            callback = handler.userRejected;
        }
        if (!callback) {
            if (promise.state === STATE_RESOLVE) {
                promiseResolve(handler.promise, promise.value);
            } else {
                promiseReject(handler.promise, promise.value);
            }
            return;
        }
        let result;
        try {
            result = callback(promise.value);
        } catch (e) {
            promiseReject(handler.promise, "Error: " + e.message);
            return;
        }
        promiseResolve(handler.promise, result);
    };
    /**
     * @param {MyPromise} promise
     * @param {*} value
     */
    const promiseResolve = function (promise, value) {
        try {
            if (value && (typeof value === "object" || typeof value === "function")) {
                if (value instanceof MyPromise) {
                    promise.state = STATE_COMPLETED;
                    promise.value = value;
                    execute(promise);
                    return;
                } else if (typeof promise.then === "function") {
                    doResolve(promise.then.bind(value), promise);
                    return;
                }
            }
            promise.state = STATE_RESOLVE;
            promise.value = value;
            execute(promise);
        } catch (e) {
            promiseReject(promise, 'Error: ' + e.message);
        }
    };
    /**
     * @param {MyPromise} promise
     * @param {*} value
     */
    const promiseReject = function (promise, value) {
        promise.state = STATE_REJECTED;
        promise.value = value;
        execute(promise);
    };
    /**
     * @param {MyPromise} promise
     */
    const execute = function (promise) {
        while (promise.handlers.length > 0) {
            handle(promise, promise.handlers.shift());
        }
    };

    /**
     * @constructor
     */
    let MyPromise = function (fn) {
        if (!(this instanceof MyPromise)) {
            throw new TypeError("Promises must be constructed via new")
        }
        if (typeof fn !== "function") {
            throw new TypeError("Not a function");
        }
        /**
         * @type {number}
         */
        this.value = NaN;
        /**
         * @type {number}
         */
        this.state = STATE_PENDING;
        /**
         * @type {Handler[]}
         */
        this.handlers = [];
        doResolve(fn, this);
    };
    /**
     *
     * @param {Function} userResolve
     * @param {Function} userRejected
     * @returns {MyPromise}
     */
    MyPromise.prototype.then = function (userResolve, userRejected) {
        let promise = new this.constructor(function () {});
        handle(this, new Handler(promise, userResolve, userRejected));
        return promise;
    };
    /**
     *
     * @param {Function} fn
     * @param {MyPromise} promise
     */
    const doResolve = function (fn, promise) {
        let done = false;
        try {
            fn(function (val) {
                if (!done) {
                    done = true;
                    promiseResolve(promise, val);
                }
            }, function (val) {
                if (!done) {
                    done = true;
                    promiseReject(promise, val);
                }
            });
        } catch (e) {
            if (!done) {
                done = true;
                promiseReject(promise, 'Error: ' + e.message);
            }
        }
    };
    getGlobalNS()['MyPromise'] = MyPromise;
})();
