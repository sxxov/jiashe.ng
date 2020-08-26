import lottie from 'lottie-web/build/player/lottie_canvas';
import { CoreAnimator } from '../../animators.js';
import { $ } from '../../utilities/$.utility.js';
export class LottieFactory {
    constructor(thisArg) {
        this.ctx = thisArg;
    }
    async create(animationObject) {
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
        if (!animation) {
            await new Promise((resolve) => $(animation).on('DOMLoaded', () => resolve));
        }
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