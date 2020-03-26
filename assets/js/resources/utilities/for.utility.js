var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            forAwait(callback, ctx = null) {
                return __awaiter(this, void 0, void 0, function* () {
                    const workingArray = this;
                    for (let i = 0, l = workingArray.length; i < l; ++i) {
                        yield callback.call(ctx || this, workingArray[i], i);
                    }
                });
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