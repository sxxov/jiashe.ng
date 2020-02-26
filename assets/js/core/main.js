var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TV } from './tv.js';
import { ScrollAnimator, FrameAnimator, } from '../resources/animators.js';
import { $, WindowUtility, } from '../resources/utilities.js';
class Main {
    constructor() {
        this.mTV = new TV();
        this.miscellaneousScrollingAnimator = new ScrollAnimator();
        this.scrollToContinueFrameAnimator = new FrameAnimator();
        this.mWindowUtility = new WindowUtility();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mTV.init();
            yield this.addMiscellaneousScrollingAnimations();
            yield this.addScrollToContinueFrameAnimation();
            yield this.addHeaderFrameAnimation();
        });
    }
    addMiscellaneousScrollingAnimations() {
        return __awaiter(this, void 0, void 0, function* () {
            const mScrollAnimator = this.miscellaneousScrollingAnimator;
            yield mScrollAnimator.add({
                index: -1,
                type: 'null',
                items: {
                    uid: 'pre',
                    onVisible: () => {
                        this.scrollToContinueFrameAnimator.animatorContainers.forEach((animatorContainer) => this.scrollToContinueFrameAnimator.activate(animatorContainer));
                    },
                    onHidden: () => {
                        this.scrollToContinueFrameAnimator.animatorContainers.forEach((animatorContainer) => this.scrollToContinueFrameAnimator.deactivate(animatorContainer));
                    },
                },
            });
            yield mScrollAnimator.add({
                index: 0,
                type: 'lottie',
                data: yield $().getJSON('/assets/js/raw/lottie/blocks.json'),
                items: {
                    uid: 'blocks',
                    respectDevicePixelRatio: false,
                    totalFrames: 150,
                },
            });
            yield mScrollAnimator.add({
                index: 0,
                type: 'lottie',
                data: yield $().getJSON('/assets/js/raw/lottie/hello.json'),
                items: {
                    uid: 'hello',
                    invert: true,
                    totalFrames: 120,
                },
            });
            yield mScrollAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    onFrame: (animation, frame) => {
                        $('.overlay').css({
                            opacity: Math.min((frame / mScrollAnimator.totalFrames) * 2, 0.5),
                        });
                    },
                },
            });
        });
    }
    addScrollToContinueFrameAnimation() {
        return __awaiter(this, void 0, void 0, function* () {
            const mFrameAnimator = this.scrollToContinueFrameAnimator;
            yield mFrameAnimator.add({
                index: 0,
                type: 'lottie',
                data: yield $().getJSON('/assets/js/raw/lottie/scroll to continue.json'),
                items: {
                    uid: 'scrollToContinue',
                    respectDevicePixelRatio: true,
                    totalFrames: 180,
                    maximumWidth: 1000,
                    onVisible: (animation) => {
                        const { onRedraw, } = animation.items;
                        onRedraw(animation);
                        mFrameAnimator.animatorContainersWrapper.addClass('invert');
                    },
                    onRedraw: (animation) => {
                        const { domContent, } = animation.items;
                        domContent.css({
                            transform: `translateY(${this.mWindowUtility.viewport.height / 3}px)`,
                        });
                    },
                },
            });
            mFrameAnimator.repeat(0, 180);
        });
    }
    addHeaderFrameAnimation() {
        return __awaiter(this, void 0, void 0, function* () {
            const mFrameAnimator = new FrameAnimator();
            yield mFrameAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    uid: 'logo',
                    totalFrames: 120,
                    domContent: $('.logo'),
                    onVisible: (animation) => {
                        const { domContent, } = animation.items;
                        domContent.removeClass('hidden');
                        $(domContent.childNodes[1]).css({
                            fill: 'white',
                        });
                    },
                    onFrame: (animation, frame) => {
                        const { domContent, totalFrames, } = animation.items;
                        const finalPosition = 100;
                        domContent.css({
                            transform: `translateY(${((frame / totalFrames) * finalPosition) - finalPosition}px)`,
                        });
                    },
                },
            });
            mFrameAnimator.animate(0, 120, {
                bezier: [0.77, 0, 0.175, 1],
            });
        });
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (new Main()).init();
}))();
//# sourceMappingURL=main.js.map