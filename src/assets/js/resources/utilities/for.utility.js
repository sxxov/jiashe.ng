export class ForUtility {
    static addToArrayPrototype() {
        // non-standard, used by this to keep track of the singleton
        if (Array.prototype.__forUtilitySingletonExecuted) {
            return;
        }
        const methods = {
            fastEach(callback, ctx = null) {
                const workingArray = this;
                if (ctx === null) {
                    for (let i = 0, l = workingArray.length; i < l; ++i) {
                        callback(workingArray[i], i);
                    }
                    return;
                }
                for (let i = 0, l = workingArray.length; i < l; ++i) {
                    callback.call(ctx || this, workingArray[i], i);
                }
            },
            async forAwait(callback, ctx = null) {
                const workingArray = this;
                for (let i = 0, l = workingArray.length; i < l; ++i) {
                    await callback.call(ctx || this, workingArray[i], i);
                }
            },
            getAll(callback, ctx = null) {
                const workingArray = this;
                const returnValues = [];
                for (let i = 0, l = workingArray.length; i < l; ++i) {
                    if (callback.call(ctx || this, workingArray[i], i)) {
                        returnValues.push(workingArray[i]);
                    }
                }
                return returnValues;
            },
            getSome(callback, ctx = null) {
                const workingArray = this;
                for (let i = 0, l = workingArray.length; i < l; ++i) {
                    if (callback.call(ctx || this, workingArray[i], i)) {
                        return workingArray[i];
                    }
                }
                return null;
            },
        };
        Object.keys(methods).forEach((key) => {
            Array.prototype[key] = methods[key];
        });
        Array.prototype.__forUtilitySingletonExecuted = true;
    }
}
//# sourceMappingURL=for.utility.js.map