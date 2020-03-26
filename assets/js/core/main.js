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
import { Hamburger } from './hamburger.js';
import { ScrollAnimator, FrameAnimator, } from '../resources/animators.js';
import { $, WindowUtility, ForUtility, } from '../resources/utilities.js';
import { SmoothScroll, } from '../raw/libraries/smoothscroll.js';
class Main {
    constructor() {
        this.mTV = new TV();
        this.miscellaneousScrollingAnimator = new ScrollAnimator();
        this.scrollToContinueFrameAnimator = new FrameAnimator();
        this.hamburger = new Hamburger(this.miscellaneousScrollingAnimator);
        this.mWindowUtility = new WindowUtility();
        ForUtility.addToArrayPrototype();
        SmoothScroll.init({
            animationTime: 500,
            touchpadSupport: true,
            pulseScale: 8,
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mTV.init();
            yield this.addScrollToContinueFrameAnimation();
            yield this.addHeaderFrameAnimation();
            yield this.addMiscellaneousScrollingAnimations();
        });
    }
    addMiscellaneousScrollingAnimations() {
        return __awaiter(this, void 0, void 0, function* () {
            const mScrollAnimator = this.miscellaneousScrollingAnimator;
            // meta
            yield mScrollAnimator.add({
                type: 'meta',
                index: -2,
                items: {
                    onFrame: ((animation, frame) => {
                        const { uid, totalFrames, } = animation.items;
                        let scrollPercent = ((Math.min(Math.max(frame, 0) / (totalFrames - 1), 1)) * 100)
                            .toString();
                        switch (true) {
                            case scrollPercent === 'NaN'
                                || scrollPercent === '0':
                                scrollPercent = '.00';
                                break;
                            case scrollPercent.substr(0, 2) === '0.':
                                scrollPercent = scrollPercent
                                    .substr(1)
                                    .substring(0, 3);
                                break;
                            case scrollPercent.substring(1, 2) === '.':
                                scrollPercent = scrollPercent
                                    .substring(0, 3);
                                break;
                            case scrollPercent === '100':
                                break;
                            default:
                                scrollPercent = scrollPercent
                                    .substr(0, scrollPercent.indexOf('.'))
                                    .padStart(3, '0');
                        }
                        $('.scrollCounter > h1').innerHTML = `${scrollPercent}%`;
                        [$('.scrollCounter > h2').innerHTML] = uid.split(' ');
                    }),
                },
            });
            // pre
            yield mScrollAnimator.add({
                index: -1,
                type: 'null',
                items: {
                    uid: 'welcome',
                    onVisible: () => {
                        this.scrollToContinueFrameAnimator.animatorContainers.forEach((animatorContainer) => this.scrollToContinueFrameAnimator.activate(animatorContainer));
                    },
                    onHidden: () => {
                        this.scrollToContinueFrameAnimator.animatorContainers.forEach((animatorContainer) => this.scrollToContinueFrameAnimator.deactivate(animatorContainer));
                    },
                },
            });
            // custom uid for index 0
            yield mScrollAnimator.add({
                type: null,
                index: 0,
                items: {
                    uid: 'about_me',
                },
            });
            // blocks
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
            // aux about me stuff
            yield mScrollAnimator.add({
                index: 0,
                type: 'lottie',
                data: yield $().getJSON('/assets/js/raw/lottie/aux about me stuff.json'),
                items: {
                    uid: 'aux_about_me_stuff',
                    respectDevicePixelRatio: false,
                    invert: true,
                    totalFrames: 120,
                },
            });
            // aux about me dots
            yield mScrollAnimator.add({
                index: 0,
                type: 'lottie',
                data: yield $().getJSON('/assets/js/raw/lottie/aux about me dots.json'),
                items: {
                    uid: 'aux_about_me_dots',
                    respectDevicePixelRatio: false,
                    invert: true,
                    totalFrames: 120,
                },
            });
            // hello
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
            // overlayController
            yield mScrollAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    uid: 'overlayController',
                    totalFrames: 120,
                    onFrame: (animation, frame) => {
                        $('.overlay').css({
                            opacity: Math.min((frame / mScrollAnimator.totalFrames) * 2, 0.5),
                        });
                    },
                },
            });
            // placeholder
            yield mScrollAnimator.add({
                index: 1,
                type: 'solid',
                items: {
                    uid: 'what_now?',
                    respectDevicePixelRatio: false,
                    totalFrames: 150,
                },
            });
            // aux what now stuff
            yield mScrollAnimator.add({
                index: 1,
                type: 'lottie',
                data: yield $().getJSON('/assets/js/raw/lottie/aux what now stuff.json'),
                items: {
                    uid: 'aux_what_now_stuff',
                    respectDevicePixelRatio: false,
                    invert: true,
                    totalFrames: 120,
                },
            });
            // aux what dots
            yield mScrollAnimator.add({
                index: 1,
                type: 'lottie',
                data: yield $().getJSON('/assets/js/raw/lottie/aux what now dots.json'),
                items: {
                    uid: 'aux_what_now_dots',
                    respectDevicePixelRatio: false,
                    invert: true,
                    totalFrames: 120,
                },
            });
        });
    }
    addScrollToContinueFrameAnimation() {
        return __awaiter(this, void 0, void 0, function* () {
            const mFrameAnimator = this.scrollToContinueFrameAnimator;
            // scrollToContinue
            yield mFrameAnimator.add({
                index: 0,
                type: 'lottie',
                data: yield $().getJSON('/assets/js/raw/lottie/scroll to continue.json'),
                items: {
                    uid: 'scrollToContinue',
                    respectDevicePixelRatio: true,
                    totalFrames: 180,
                    width: {
                        maximum: 1300,
                    },
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
            // logo
            yield mFrameAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    uid: 'logo',
                    totalFrames: 240,
                    domContent: $('.logo'),
                    bezier: [0.77, 0, 0.175, 1],
                    onVisible: (animation) => {
                        const { domContent, } = animation.items;
                        domContent.removeClass('hidden');
                    },
                    onFrame: (animation, frame) => {
                        const { domContent, totalFrames, } = animation.items;
                        const finalPosition = 120;
                        domContent.css({
                            transform: `translateY(${((frame / totalFrames) * finalPosition) - finalPosition}px)`,
                        });
                    },
                },
            });
            // scrollCounter
            yield mFrameAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    uid: 'scrollCounter',
                    totalFrames: 240,
                    offset: 40,
                    domContent: $('.scrollCounter'),
                    bezier: [0.77, 0, 0.175, 1],
                    onVisible: (animation) => {
                        const { domContent, } = animation.items;
                        domContent.removeClass('hidden');
                        domContent.css({
                            transform: 'translateY(-10000px)',
                        });
                    },
                    onFrame: (animation, frame) => {
                        const { domContent, totalFrames, } = animation.items;
                        const finalPosition = -120;
                        domContent.css({
                            transform: `translateY(${((frame / totalFrames) * finalPosition) - finalPosition}px)`,
                        });
                    },
                },
            });
            // hamburger menu
            yield mFrameAnimator.add({
                index: 0,
                type: 'null',
                data: yield this.hamburger.getLottieData(),
                items: {
                    uid: 'hamburger',
                    totalFrames: 240,
                    offset: 80,
                    domContent: this.hamburger.headerHamburgerIconDom,
                    bezier: [0.77, 0, 0.175, 1],
                    onVisible: (animation) => {
                        const { items, data, } = animation;
                        const { domContent, } = items;
                        domContent.removeClass('hidden');
                        domContent.css({
                            transform: 'translateY(-10000px)',
                        });
                        this.hamburger.create(data);
                    },
                    onFrame: (animation, frame) => {
                        const { domContent, totalFrames, } = animation.items;
                        const finalPosition = 120;
                        domContent.css({
                            transform: `translateY(${((frame / totalFrames) * finalPosition) - finalPosition}px)`,
                        });
                    },
                },
            });
            // to control the various elements size, for css animation on mobile when the url bar appears
            const sizeController = () => {
                const viewportHeight = this.mWindowUtility.viewport.height;
                const innerHeight = this.mWindowUtility.inner.height;
                const header = $('.header.containersWrapper');
                const hamburgerMenu = $('.__hamburgerMenu.containersWrapper');
                if (viewportHeight === innerHeight) {
                    header.css({
                        height: viewportHeight,
                    });
                    hamburgerMenu.css({
                        height: viewportHeight,
                    });
                }
                else {
                    header.css({
                        height: innerHeight,
                    });
                    hamburgerMenu.css({
                        height: innerHeight,
                    });
                }
            };
            sizeController();
            $(window).on('resize', sizeController);
            mFrameAnimator.animate(0, 240);
        });
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (new Main()).init();
}))();
//# sourceMappingURL=main.js.map