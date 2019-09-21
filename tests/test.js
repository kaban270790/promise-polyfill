require('../myPromise.js');
const assert = require("assert");
const {describe, it} = require("mocha");
it("from description home work", () => {

    let promise = new MyPromise(function (resolve) {
        resolve(42);
    });

    promise
        .then(function (value) {
            assert.strictEqual(42, value);
            return value + 1
        })
        .then(function (value) {
            assert.strictEqual(43, value);
            return new MyPromise(function (resolve) {
                resolve(137)
            })
        })
        .then(function (value) {
            assert.strictEqual(137, value);
            throw new Error("error message")
        })
        .then(
            function () {
                assert.fail("false run");
            },
            function (err) {
                assert.strictEqual("error message", err);
                return "ошибка обработана"
            }
        )
        .then(function (value) {
            assert.strictEqual("ошибка обработана", value);
        })
});
describe("testing promise then", () => {
    it("one then, resolve", () => {
        (new MyPromise((resolve) => {
            resolve(1);
        })).then((value) => {
            assert.strictEqual(1, value);
        });
    });
    it("two then, resolve", () => {
        (new MyPromise((resolve) => {
            resolve(1);
        })).then((value) => {
            assert.strictEqual(1, value);
            return ++value;
        }).then((value) => {
            assert.strictEqual(2, value);
        });
    });
    it("then return new promise", () => {
        (new MyPromise((resolve) => {
            resolve(1);
        })).then((value) => {
            assert.strictEqual(1, value);
            return (new MyPromise((resolve) => {
                resolve(++value);
            }));
        }).then((value) => {
            assert.strictEqual(2, value);
        });
    });
    it("rejected", () => {
        (new MyPromise((resolve, rejected) => {
            rejected("error");
        })).then((value) => {
            assert.fail("false run");
            return ++value
        }, function (err) {
            assert.strictEqual("error", err);
        });
    });
});
describe("testing promise catch", () => {
    it("reject from init promise, non then", () => {
        (new MyPromise((resolve, rejected) => {
            rejected("message");
        })).catch((err) => {
            assert.strictEqual("message", err);
        });
    });
    it("reject from init promise, after then", () => {
        (new MyPromise((resolve, rejected) => {
            rejected("message");
        })).then((value) => {
            assert.fail("false run");
        });
    });
    it("reject from init promise, before then", () => {
        (new MyPromise((resolve, rejected) => {
            rejected("message");
        })).catch((err) => {
            assert.strictEqual("message", err);
            return "all good";
        }).then((value) => {
            assert.strictEqual("all good", value);
        });
    });
    it("ignore catch", () => {
        (new MyPromise((resolve, rejected) => {
            resolve("ignore");
        })).catch((err) => {
            assert.fail("false run");
            return "all good";
        }).then((value) => {
            assert.strictEqual("ignore", value);
        });
    });
});

