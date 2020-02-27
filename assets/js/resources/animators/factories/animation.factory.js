export class AnimationFactory {
    create(options, thisArg) {
        const baseObject = Object.assign({ type: undefined, index: undefined, data: undefined }, options);
        const baseItemsObject = Object.assign({ __caller: thisArg.constructor, uid: Date.now().toString(), domContent: null, offset: 0, lottieObject: null, respectDevicePixelRatio: true, totalFrames: null, maximumHeight: 0, maximumWidth: 0, minimumHeight: 0, minimumWidth: 0, onFrame: () => { }, onVisible: () => { }, onHidden: () => { }, onRedraw: () => { } }, options.items);
        return Object.assign(Object.assign({}, baseObject), { items: baseItemsObject });
    }
}
//# sourceMappingURL=animation.factory.js.map