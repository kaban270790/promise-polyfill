let PromisePolyfill = (function () {
    /**
     * Проверяем наличие промисов в глобали
     * @returns {boolean}
     */
    const checkExistPromise = function () {
        let globalNs;
        switch ("undefined") {
            case typeof self:
                globalNs = self;
                break;
            case typeof window:
                globalNs = window;
                break;
            case typeof global:
                globalNs = global;
                break;
            default:
                throw new Error("unable to locate global object");
        }
        return ('Promise' in globalNs);
    };

    const STATE_PENDING = 0;
    const STATE_FINALITY = 1;
    const STATE_REJECTED = 2;

    const MyPromise = function (fn) {
        if (!(this instanceof MyPromise)) {
            throw new TypeError("Promises must be constructed via new")
        }
        if (typeof fn !== "function") {
            throw new TypeError("Not a function");
        }
        this.state = STATE_PENDING;
        this.value = undefined;
        doResolve(fn, this);
    };
    /**
     * @param {MyPromise} self
     * @param {MyPromise} val
     */
    const resolve = function (self, val) {
        try {
            if (val && (typeof val === "object" || typeof val === "function")) {
                if (val instanceof Promise) {

                } else if (typeof val.then === "function") {
                    doResolve(val.then.bind(self, [val]), self);
                }
            }
            self.state = STATE_FINALITY;
            self.value = val;
        } catch (e) {
            reject(self, 'Error: ' + e.message);
        }
    };
    /**
     * @param {Function} fn
     * @param {MyPromise} self
     */
    const doResolve = function (fn, self) {
        let done = false;
        try {
            fn(function (val) {
                    if (!done) {
                        done = true;
                        resolve(self, val)
                    }
                },
                function (err) {
                    if (!done) {
                        done = true;
                        reject(self, err);
                    }
                });
        } catch (e) {
            if (!done) {
                done = true;
                reject(self, 'Error: ' + e.message);
            }
        }
    };
    return MyPromise;
})();
