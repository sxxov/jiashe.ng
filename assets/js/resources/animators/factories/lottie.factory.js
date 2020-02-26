var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $ } from '../../utilities.js';
export class LottieFactory {
    constructor(thisArg) {
        this.ctx = thisArg;
    }
    create(animationObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const className = animationObject.items.uid;
            const animation = this.ctx.lottie.loadAnimation({
                container: this.createAndReturnNewContainerDom(animationObject),
                renderer: 'canvas',
                loop: true,
                autoplay: true,
                animationData: animationObject.data,
                rendererSettings: {
                    dpr: animationObject.items.respectDevicePixelRatio === false
                        ? 1
                        : this.ctx.dpr * this.ctx.dprMultiplier,
                    preserveAspectRatio: 'xMidYMid slice',
                    className: `${this.ctx.animatorClassPrefix} ${className} hidden`,
                },
            });
            const totalFrames = (animationObject.items.totalFrames
                || animation.getDuration(true));
            const onFrame = (animationItem, frame) => {
                animationItem
                    .items
                    .lottieObject
                    .animation
                    .goToAndStop(frame, true);
            };
            const lottieObject = {
                className,
                animation,
                totalFrames,
                onFrame,
            };
            lottieObject.animation.goToAndStop(-1, true);
            yield $(lottieObject.animation).on('DOMLoaded', () => new Promise((resolve) => resolve));
            this.onLottieObjectCreated(lottieObject);
            return lottieObject;
        });
    }
    onLottieObjectCreated(lottieObject) {
        const lottieObjectDom = $(`.${lottieObject.className}`);
        lottieObjectDom.css({
            width: '',
            height: '',
            position: 'fixed',
        });
        lottieObjectDom.width = 1;
        lottieObjectDom.height = 1;
    }
    createAndReturnNewContainerDom(animationObject) {
        const animatorContainer = $(document.createElement('div'));
        animatorContainer.addClass([
            this.ctx.animatorClassPrefix,
            'container',
            this.ctx.uid,
            'height',
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
//# sourceMappingURL=lottie.factory.js.map