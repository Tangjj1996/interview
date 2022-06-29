function MyPromise(exector) {
    this.state = 'pending'
    this.onFulfilledCallback = []
    this.onRejectedCallback = []

    const self = this
    function resolve(value) {
        setTimeout(() => {
            if (self.state === 'pending') {
                self.state = 'fulfilled'
                self.data = value
                while(self.onFulfilledCallback.length) {
                    const cb = self.onFulfilledCallback.shift()
                    cb && cb(value)
                }
            }
        });
    }
    function reject(reason) {
        setTimeout(() => {
            if (self.state === 'pending') {
                self.state = 'rejected'
                self.data = reason
                while(self.onRejectedCallback.length) {
                    const cb = self.onRejectedCallback.shift()
                    cb && cb(reason)
                }
            } 
        });
    }
    try {
        exector(resolve, reject)
    } catch(e) {
        reject(e)
    }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
    const self = this
    let promise2
    return promise2 = new MyPromise(function(resolve, reject) {
        if (self.state === 'fulfilled') {
            setTimeout(() => {
                if (typeof onFulfilled === 'function') {
                    try {
                        const x = onFulfilled(self.data)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                } else {
                    resolve(self.data)
                }
            }, 0);
        } else if (self.state === 'rejected') {
            setTimeout(() => {
                if (typeof onRejected === 'function') {
                    try {
                        const x = onRejected(self.data)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                } else {
                    reject(self.data)
                }
            }, 0);
        } else if (self.state === 'pending') {
            self.onFulfilledCallback.push(function(promise1Value) {
                if (typeof onFulfilled === 'function') {
                    try {
                        const x = onFulfilled(self.data)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                } else {
                    resolve(promise1Value)
                }
            })
            self.onRejectedCallback.push(function(promise1Reason) {
                if (typeof onRejected === 'function') {
                    try {
                        const x = onRejected(self.data)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                } else {
                    reject(promise1Reason)
                }
            })
        }
    })
}

function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise'))
    }
    if (x instanceof MyPromise) {
        if (x.state === 'pending') {
            x.then(function (value) {
                resolvePromise(promise2, value, resolve, reject)
            }, reject)
        } else if (x.state === 'fulfilled') {
            resolve(x.data)
        } else if (x.state === 'rejected') {
            reject(x.data)
        }
        return  
    }
    if (x && (typeof x === 'object' || typeof x === 'function')) {
        let isCalled = false
        try {
            let then = x.then
            if (typeof then === 'function') {
                then.call(x, function (y) {
                    if (isCalled) return
                    isCalled = true
                    return resolvePromise(promise2, y, resolve, reject)
                }, function (r) {
                    if (isCalled) return
                    isCalled = true
                    return reject(r)
                })
            } else {
                resolve(x)
            }
        } catch(e) {
            if (isCalled) return
            isCalled = true
            reject(e)
        }
    } else {
        resolve(x)
    }
}

module.exports = MyPromise