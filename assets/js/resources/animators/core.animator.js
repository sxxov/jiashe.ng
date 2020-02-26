var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { $, WindowUtility, BezierUtility, } from '../utilities.js';
import { lottie } from '../lottie.js';
import { LottieFactory, AnimationFactory, } from '../animators.factories.js';
// TODO:investigate issue of lottie disappearing when mobile scroll hits innerHeight,
//		but reappears after viewport becomes innerHeight
export class CoreAnimator {
    constructor() {
        this.lottie = lottie;
        this.mWindowUtility = new WindowUtility();
        this.uid = Date.now().toString();
        this.currentFrame = 0;
        this.totalFrames = 0;
        this.framesPerAnimation = 120;
        this.animations = [];
        this.animatorClassPrefix = '__animate';
        this.animatorContainers = [];
        this.animatorContainersWrapper = null;
        this.visibleAnimations = null;
        this.dpr = Math.max(window.devicePixelRatio / 2, 1);
        this.dprMultiplier = this.dpr;
        this.rawAnimateInstance = null;
        this.createContainerWrapperDom();
        $(window).on('load resize', () => window.requestAnimationFrame(() => {
            this.onWindowResize.call(this);
            if (this.visibleAnimations !== null) {
                this.visibleAnimations.forEach((animation) => {
                    animation.items.onRedraw.call(this, animation);
                });
            }
        }));
    }
    createContainerWrapperDom() {
        this.animatorContainersWrapper = $(document.createElement('div'));
        this.animatorContainersWrapper.addClass([
            this.animatorClassPrefix,
            'containerWrapper',
            this.uid,
        ]);
        this.activate(this.animatorContainersWrapper);
        document.body.appendChild(this.animatorContainersWrapper);
    }
    createAndReturnNewContainerDom(_a) {
        var { invert = false } = _a, options = __rest(_a, ["invert"]);
        const animatorContainer = $(document.createElement('div'));
        Object.keys(options).forEach((optionKey) => {
            animatorContainer[optionKey] = options[optionKey];
        });
        animatorContainer.addClass([
            this.animatorClassPrefix,
            'container',
            this.uid,
            'height',
        ]);
        if (invert === true) {
            animatorContainer.addClass('invert');
        }
        this.activate(animatorContainer);
        this.animatorContainersWrapper.appendChild(animatorContainer);
        this.animatorContainers.push(animatorContainer);
        return animatorContainer;
    }
    createAndReturnLottieObject(animationObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const mLottieFactory = new LottieFactory(this);
            return mLottieFactory.create(animationObject);
        });
    }
    add(animationToBeConstructed) {
        return __awaiter(this, void 0, void 0, function* () {
            const mAnimationFactory = new AnimationFactory();
            const animationObject = mAnimationFactory.create(animationToBeConstructed, this);
            const { type, index, items: options, } = animationObject;
            let lottieObject = null;
            switch (type) {
                case 'null':
                    break;
                case 'lottie':
                    lottieObject = yield this.createAndReturnLottieObject(animationObject);
                    animationObject.items = Object.assign(Object.assign({}, animationObject.items), { totalFrames: lottieObject.totalFrames, domContent: $(`.${lottieObject.className}`), onFrame: (animationItem, frame) => {
                            lottieObject.onFrame(animationItem, frame);
                            if (!options.onFrame
                                || options.onFrame.constructor !== Function) {
                                return;
                            }
                            options.onFrame(animationItem, frame);
                        }, onRedraw: (animationItem) => {
                            this.onRedraw(animationItem);
                            if (options.onRedraw === undefined
                                || options.onRedraw.constructor !== Function) {
                                return;
                            }
                            options.onRedraw(animationItem);
                        }, lottieObject });
                    break;
                default:
            }
            switch (true) {
                case index === null
                    || index.constructor !== Number:
                    // add to the end of the array
                    this.animations.push([animationObject]);
                    break;
                case this.animations[index] === undefined:
                    // add a nested array to the index
                    this.animations[index] = [animationObject];
                    break;
                case this.animations[index].constructor === Array:
                    // add to the nested array at the index
                    this.animations[index].push(animationObject);
                    break;
                default:
            }
            // get an array of the 'totalFrames' of every animation,
            this.totalFrames = this.animations.map((animationItem) => Math.max(...animationItem.map((workingAnimation) => (workingAnimation.items.lottieObject
                ? workingAnimation.items.totalFrames
                : 0)))).reduce((accumulator, currentValue) => currentValue + accumulator, 0);
            this.onNewAnimation(animationObject);
        });
    }
    getRelativeFrame(frame) {
        return frame * this.totalFrames;
    }
    rawAnimate(items, callback) {
        const { from, to, options: { fps = 120, bezier = [], } = {}, } = items;
        if (items.options === undefined) {
            return this.rawAnimate({
                from,
                to,
                options: {},
            }, callback);
        }
        if (from === to) {
            return new Promise((resolve) => resolve());
        }
        if (this.rawAnimateInstance !== null) {
            clearInterval(this.rawAnimateInstance);
        }
        let processedCallback = callback;
        if (bezier !== []
            && bezier.length === 4) {
            const mBezierUtility = new BezierUtility(bezier[0], bezier[1], bezier[2], bezier[3]);
            processedCallback = (frame) => callback(mBezierUtility.getValue(
            // offset frame so it starts from 'from'
            (frame - from)
                // divide by, the amount of frames in between 'to' & 'from'
                / (to - from)) * (to - from));
        }
        return new Promise((resolve) => {
            let i = from;
            this.rawAnimateInstance = setInterval(() => {
                if (i > to) {
                    clearInterval(this.rawAnimateInstance);
                    this.rawAnimateInstance = null;
                    resolve();
                    return;
                }
                window.requestAnimationFrame(() => processedCallback(i));
                ++i;
            }, 1000 / fps);
        });
    }
    onNewAnimation(animation) {
        const { onRedraw, domContent, } = animation.items;
        if (domContent !== null) {
            this.hide(domContent);
        }
        onRedraw(animation);
        this.onWindowResize();
        this.visibleAnimations = null;
        this.onFrame(this.currentFrame);
    }
    onWindowResize() {
        if (!this.animatorContainers) {
            return;
        }
        const viewportHeight = this.mWindowUtility.viewport.height;
        const innerHeight = this.mWindowUtility.inner.height;
        this.animatorContainers.forEach((animatorContainer) => {
            // TODO: implement { maximumWidth, minimumWidth, maximumHeight, minimumHeight }
            // const containerHeight = animatorContainer.css('height', { computed: true });
            // const containerWidth = animatorContainer.css('width', { computed: true });
            // animatorContainer.css('height',
            // 	containerHeight);
            // animatorContainer.css('width',
            // 	containerWidth);
            if (viewportHeight === innerHeight) {
                animatorContainer.addClass('viewport');
                animatorContainer.removeClass('inner');
            }
            else {
                animatorContainer.addClass('inner');
                animatorContainer.removeClass('viewport');
            }
        });
        this.lottie.resize();
    }
    onRedraw(animation) {
        const { respectDevicePixelRatio, lottieObject, domContent, } = animation.items;
        if (!lottieObject) {
            return;
        }
        const lottieObjectDom = $(domContent);
        if (respectDevicePixelRatio !== false) {
            const lottieObjectContainerWrapperWidth = this.animatorContainersWrapper.clientWidth;
            const lottieObjectContainerWrapperHeight = this.animatorContainersWrapper.clientHeight;
            const lottieObjectWidth = parseFloat(lottieObjectDom.css('width', { computed: true })) / this.dprMultiplier;
            const lottieObjectHeight = parseFloat(lottieObjectDom.css('height', { computed: true })) / this.dprMultiplier;
            const offsetWidth = -(lottieObjectWidth - lottieObjectContainerWrapperWidth) / 2;
            const offsetHeight = -(lottieObjectHeight - lottieObjectContainerWrapperHeight) / 2;
            lottieObjectDom.css({
                transform: `translate(${offsetWidth}px, ${offsetHeight}px) scale(${1 / this.dprMultiplier})`,
            });
        }
    }
    onFrame(frame) {
        if (!(this.animations.length > 0)) {
            return;
        }
        let animationIndex = null;
        let currentAnimationsTotalFrames = null;
        // TODO: optimize below code, use caching or something
        // get an array of the 'totalFrames' of every animation,
        this.animations.map((animation) => Math.max(...animation.map((workingAnimation) => (workingAnimation
            ? workingAnimation.items.totalFrames
            : 0)))).reduce((accumulator, currentValue, i) => {
            // if the current accumulated value is more than the frame,
            // it means that we've overshot and the previous index is the current animation
            if (currentValue + accumulator >= frame) {
                if (animationIndex === null) {
                    animationIndex = i;
                    currentAnimationsTotalFrames = currentValue + accumulator;
                }
                return 0;
            }
            // not there yet, continue accumulating
            return currentValue + accumulator;
        }, 0);
        animationIndex = (animationIndex === null
            || frame <= 0
            ? -1
            : animationIndex);
        const workingAnimations = this.animations[animationIndex];
        if (!workingAnimations) {
            return;
        }
        workingAnimations.forEach((workingAnimation) => {
            const { __caller, uid, totalFrames, onFrame, } = workingAnimation.items;
            const currentAnimationTotalFrames = workingAnimation
                ? totalFrames
                : 0;
            const globalFrame = frame;
            const localFrame = ((globalFrame - ((animationIndex) * currentAnimationsTotalFrames))
                / currentAnimationsTotalFrames)
                * currentAnimationTotalFrames;
            this.currentFrame = frame;
            this.onVisibleAnimationsChange(workingAnimations);
            if (__caller.name !== 'FrameAnimator'
                || uid === 'logo') {
                console.log('workingAnimation', workingAnimation);
                console.log('globalFrame', globalFrame);
                console.log('animationIndex', animationIndex);
                console.log('localFrame', localFrame);
                console.log('currentAnimationsTotalFrames', currentAnimationsTotalFrames);
                console.log('currentAnimationTotalFrames', currentAnimationTotalFrames);
                console.log('');
            }
            onFrame(workingAnimation, localFrame);
        });
    }
    onVisibleAnimationsChange(animations) {
        if (this.visibleAnimations === animations) {
            return;
        }
        animations.forEach((animation) => {
            const { onVisible, onRedraw, domContent, } = animation.items;
            onVisible(animation);
            onRedraw(animation);
            if (domContent === null) {
                return;
            }
            this.unhide(domContent);
        });
        if (this.visibleAnimations === null) {
            this.visibleAnimations = animations;
            return;
        }
        if (this.visibleAnimations === animations) {
            return;
        }
        this.visibleAnimations.forEach((visibleAnimation) => {
            const { onHidden, domContent, } = visibleAnimation.items;
            onHidden(visibleAnimation);
            if (domContent === null) {
                return;
            }
            this.hide(domContent);
        });
        this.visibleAnimations = animations;
    }
    hide(domElement) {
        return $(domElement).addClass('hidden');
    }
    unhide(domElement) {
        return $(domElement).removeClass('hidden');
    }
    activate(domElement) {
        return $(domElement).addClass('active');
    }
    deactivate(domElement) {
        return $(domElement).removeClass('active');
    }
}
//# sourceMappingURL=core.animator.js.map