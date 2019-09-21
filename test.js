require('./myPromise.js');

(new MyPromise(function (resolve, rejected) {
    setTimeout(function () {
        console.log(1);
        resolve(43);
    }, 1000);
})).then(function (val) {
    console.log(++val);
    return val;
}, function (err) {
    console.log(err);
}).then(function (val) {
    console.log(++val);
    return val;
}, function (err) {
    console.log(err);
});
