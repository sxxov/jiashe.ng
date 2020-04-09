var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CoreAnimator } from '../../animators.js';
import { $ } from '../../utilities.js';
import { lottie } from '../../../raw/libraries/lottie.js';
export class LottieFactory {
    constructor(thisArg) {
        this.ctx = thisArg;
    }
    create(animationObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const className = animationObject.items.uid;
            const animation = lottie.loadAnimation({
                container: animationObject.items.__container,
                renderer: 'canvas',
                loop: true,
                autoplay: true,
                animationData: animationObject.data,
                rendererSettings: {
                    dpr: animationObject.items.respectDevicePixelRatio === false
                        ? 1
                        : this.ctx.dpr * this.ctx.resolutionMultiplier,
                    preserveAspectRatio: 'xMidYMid slice',
                    className: `${CoreAnimator.PREFIX} ${className} hidden`,
                },
            });
            yield $(animation).on('DOMLoaded', () => new Promise((resolve) => resolve));
            const domContent = $(`.${className}`);
            const totalFrames = (animationObject.items.totalFrames
                || animation.getDuration(true));
            const onFrame = (animationItem, frame) => {
                animationItem
                    .items
                    .object
                    .lottie
                    .animation
                    .goToAndStop(frame, true);
            };
            const lottieObject = {
                animation,
                totalFrames,
                domContent,
                onFrame,
            };
            lottieObject.animation.goToAndStop(-1, true);
            this.onLottieObjectCreated(lottieObject);
            return lottieObject;
        });
    }
    onLottieObjectCreated(lottieObject) {
        const lottieObjectDom = lottieObject.domContent;
        lottieObjectDom.css({
            width: '',
            height: '',
            position: 'absolute',
        });
        lottieObjectDom.width = 1;
        lottieObjectDom.height = 1;
    }
}
//# sourceMappingURL=lottie.factory.js.map