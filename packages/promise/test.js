const MyPromise = require('./index')

MyPromise.deferred = function() {
    const obj = {}
    obj.promise = new MyPromise((resolve, reject) => {
        obj.resolve = resolve
        obj.reject = reject
    })
    return obj
}

module.exports = MyPromise