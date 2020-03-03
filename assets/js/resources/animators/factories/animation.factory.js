import { $ } from '../../utilities.js';
export class AnimationFactory {
    constructor(thisArg) {
        this.ctx = thisArg;
    }
    create(options, thisArg) {
        const baseObject = Object.assign({ type: undefined, index: undefined, data: undefined }, options);
        const baseItemsObject = Object.assign({ __caller: thisArg.constructor, __container: options.type === 'null' || options.type === 'meta' ? null : this.createAndReturnNewContainerDom(options), uid: Math.round(performance.now()).toString(), domContent: null, offset: 0, object: {}, respectDevicePixelRatio: true, totalFrames: null, height: {
                maximum: null,
                minimum: null,
            }, width: {
                maximum: null,
                minimum: null,
            }, fps: 120, onFrame: () => { }, onVisible: () => { }, onHidden: () => { }, onRedraw: () => { } }, options.items);
        return Object.assign(Object.assign({}, baseObject), { items: baseItemsObject });
    }
    createAndReturnNewContainerDom(animationObject) {
        const animatorContainer = $(document.createElement('div'));
        animatorContainer.addClass([
            this.ctx.animatorClassPrefix,
            'container',
            Math.round(performance.now()).toString(),
        ]);
        if (animationObject
            .items
            .invert === true) {
            animatorContainer.addClass('invert');
        }
        this.ctx.activate(animatorContainer);
        this.ctx.animatorContainersWrapper.appendChild(animatorContainer);
        this.ctx.animatorContainers.push(animatorContainer);
        return animatorContainer;
    }
}
//# sourceMappingURL=animation.factory.js.map