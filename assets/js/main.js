var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TV } from './core/tv.js';
import { Hamburger } from './core/hamburger.js';
import { ScrollAnimator, FrameAnimator, } from './resources/animators.js';
import { $, $$, WindowUtility, ForUtility, } from './resources/utilities.js';
import { SmoothScroll, } from './raw/libraries/smoothscroll.js';
import { Sign } from './core/sign.js';
import { Email } from './core/email.js';
import { Lighter } from './core/lighter.js';
class Main {
    constructor() {
        this.mTV = new TV();
        this.miscellaneousScrollingAnimator = new ScrollAnimator();
        this.scrollToContinueFrameAnimator = new FrameAnimator();
        this.mHamburger = new Hamburger(this.miscellaneousScrollingAnimator);
        this.mWindowUtility = new WindowUtility();
        this.mSign = new Sign();
        this.mEmail = new Email();
        this.mLigher = new Lighter();
        ForUtility.addToArrayPrototype();
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            SmoothScroll({
                animationTime: 500,
                touchpadSupport: true,
                pulseScale: 6,
            });
            yield this.addScrollToContinueFrameAnimation();
            yield this.addHeaderFrameAnimation();
            yield this.addMiscellaneousScrollingAnimations();
            yield this.mSign.create();
            yield this.mLigher.create();
            yield this.mTV.create(this.mLigher.docs);
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
                        $('.scrollCounter > h1').textContent = `${scrollPercent}%`;
                        [$('.scrollCounter > h2').textContent] = uid.split(' ');
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
                    uid: 'who_am_i?',
                },
            });
            yield mScrollAnimator.add({
                type: null,
                index: 0,
                items: {
                    uid: 'screen_controller',
                    totalFrames: 120,
                    bezier: [0.75, 0, 0.25, 1],
                    onHidden: () => {
                        $('.screen').css({
                            transform: 'scale(1)',
                        });
                        $$('.splash').fastEach((node) => node
                            .css({
                            transform: 'scale(1)',
                        }));
                    },
                    onFrame: (animation, frame) => {
                        const { totalFrames, } = animation.items;
                        $('.screen').css({
                            transform: `scale(${1 + ((frame / totalFrames) / 2)})`,
                        });
                        $$('.splash').fastEach((node) => node
                            .css({
                            transform: `scale(${1 - ((frame / totalFrames) / 4)})`,
                        }));
                    },
                },
            });
            yield mScrollAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    totalFrames: 120,
                    onFrame: (animation, frame) => {
                        const { totalFrames, } = animation.items;
                        let pointerEvents = 'none';
                        if (frame > totalFrames / 2) {
                            pointerEvents = 'auto';
                        }
                        mScrollAnimator.animations[0].fastEach((animationObject) => {
                            const { domContent, } = animationObject.items;
                            if (!domContent) {
                                return;
                            }
                            domContent.css({
                                pointerEvents,
                            });
                        });
                    },
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
            // // hello
            // await mScrollAnimator.add({
            // 	index: 0,
            // 	type: 'lottie',
            // 	data: await $().getJSON('/assets/js/raw/lottie/hello.json'),
            // 	items: {
            // 		uid: 'hello',
            // 		invert: true,
            // 		totalFrames: 120,
            // 	},
            // });
            // overlayController
            yield mScrollAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    uid: 'overlayController',
                    domContent: $('.overlay'),
                    totalFrames: 120,
                    onFrame: (animation, frame) => {
                        const { domContent, } = animation.items;
                        domContent.css({
                            opacity: Math.min((frame / mScrollAnimator.totalFrames) * 2, 0.5),
                        });
                    },
                },
            });
            // white solid background
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
            // white solid background
            yield mScrollAnimator.add({
                index: 2,
                type: 'solid',
                items: {
                    uid: 'contact_me',
                    respectDevicePixelRatio: false,
                    totalFrames: 150,
                },
            });
            // aux contact me stuff
            yield mScrollAnimator.add({
                index: 2,
                type: 'lottie',
                data: yield $().getJSON('/assets/js/raw/lottie/aux contact me stuff.json'),
                items: {
                    uid: 'aux_contact_me_stuff',
                    respectDevicePixelRatio: false,
                    invert: true,
                    totalFrames: 120,
                },
            });
            // aux contact me dots
            yield mScrollAnimator.add({
                index: 2,
                type: 'lottie',
                data: yield $().getJSON('/assets/js/raw/lottie/aux contact me dots.json'),
                items: {
                    uid: 'aux_contact_me_dots',
                    respectDevicePixelRatio: false,
                    invert: true,
                    totalFrames: 120,
                },
            });
            // email
            const email = yield mScrollAnimator.add({
                index: 2,
                type: 'lottie',
                data: yield $().getJSON('/assets/js/raw/lottie/email.json'),
                items: {
                    uid: 'email',
                    invert: true,
                    totalFrames: 120,
                },
            });
            // email on hover
            const emailDomContent = email.items.domContent;
            const { dpr, resolutionMultiplier, } = mScrollAnimator;
            this.mEmail.create({
                domContent: emailDomContent,
                dpr,
                resolutionMultiplier,
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
                            transform: `translateY(${this.mWindowUtility.viewport.height
                                / 3
                                / Math.max(window.devicePixelRatio / 2, 1)}px)`,
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
                    offset: 80,
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
                data: yield this.mHamburger.getLottieData(),
                items: {
                    uid: 'hamburger',
                    totalFrames: 240,
                    offset: 0,
                    domContent: this.mHamburger.hamburgerIconDom,
                    bezier: [0.77, 0, 0.175, 1],
                    onVisible: (animation) => {
                        const { items, data, } = animation;
                        const { domContent, } = items;
                        domContent.removeClass('hidden');
                        domContent.css({
                            transform: 'translateY(-10000px)',
                        });
                        this.mHamburger.create(data);
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
    yield (new Main()).create();
}))();
//# sourceMappingURL=main.js.map