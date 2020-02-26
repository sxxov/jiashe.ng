var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable no-extend-native */
export class ForUtility {
    addToArrayPrototype() {
        // non-standard, used by this to keep track of the singleton
        if (!Array.prototype.__forUtilitySingletonExecuted) {
            Array.prototype.__forUtilitySingletonExecuted = true;
            const methods = {
                forAwait: (callback, ctx = null) => __awaiter(this, void 0, void 0, function* () {
                    const workingArray = this;
                    for (let i = 0, l = workingArray.length; i < l; ++i) {
                        yield callback.call(ctx || this, workingArray[i], i);
                    }
                }),
                getAll: (callback, ctx = null) => {
                    const workingArray = this;
                    const returnValues = [];
                    for (let i = 0, l = workingArray.length; i < l; ++i) {
                        if (callback.call(ctx || this, workingArray[i], i)) {
                            returnValues.push(workingArray[i]);
                        }
                    }
                    return returnValues;
                },
                getSome: (callback, ctx = null) => {
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
        }
    }
}
//# sourceMappingURL=for.utility.js.map