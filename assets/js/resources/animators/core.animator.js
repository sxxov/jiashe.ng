var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $, WindowUtility, BezierUtility, } from '../utilities.js';
import { lottie } from '../../raw/libraries/lottie.js';
import { LottieFactory, SolidFactory, AnimationFactory, } from '../animators.factories.js';
export class CoreAnimator {
    constructor() {
        this.mWindowUtility = new WindowUtility();
        this.uid = Math.round(performance.now()).toString();
        this.currentFrame = 0;
        this.totalFrames = 0;
        this.animations = [];
        this.metaAnimations = [];
        this.animatorContainers = [];
        this.__animatorContainersWrapper = null;
        this.visibleAnimations = [];
        this.dpr = Math.max(window.devicePixelRatio / 2, 1);
        this.resolutionMultiplier = 1;
        this.rafId = null;
        this.maxAttributeCache = {};
        this.minAttributeCache = {};
        $(window).on('load resize', () => window.requestAnimationFrame(() => {
            this.onWindowResize.call(this);
            if (this.visibleAnimations !== null) {
                this.visibleAnimations.forEach((animation) => {
                    animation.items.onRedraw.call(this, animation);
                });
            }
        }));
    }
    get animatorContainersWrapper() {
        if (this.__animatorContainersWrapper) {
            return this.__animatorContainersWrapper;
        }
        this.__animatorContainersWrapper = $(document.createElement('div'));
        this.__animatorContainersWrapper.addClass([
            CoreAnimator.PREFIX,
            'containersWrapper',
            this.uid,
            'height',
        ]);
        this.activate(this.__animatorContainersWrapper);
        $('.painting').appendChild(this.__animatorContainersWrapper);
        return this.__animatorContainersWrapper;
    }
    add(animationToBeConstructed) {
        return __awaiter(this, void 0, void 0, function* () {
            const mAnimationFactory = new AnimationFactory(this);
            const animationObject = mAnimationFactory.create(animationToBeConstructed);
            const { type, index, items, } = animationObject;
            let lottieObject = null;
            let solidObject = null;
            switch (type) {
                case 'null':
                    break;
                case 'meta':
                    break;
                case 'solid':
                    solidObject = yield (new SolidFactory(this)).create(animationObject);
                    animationObject.items = Object.assign(Object.assign({}, items), { domContent: solidObject.domContent });
                    break;
                case 'lottie':
                    lottieObject = yield (new LottieFactory(this)).create(animationObject);
                    animationObject.items = Object.assign(Object.assign({}, items), { totalFrames: lottieObject.totalFrames, domContent: lottieObject.domContent, onFrame: (animationItem, frame) => {
                            lottieObject.onFrame(animationItem, frame);
                            items.onFrame(animationItem, frame);
                        }, onRedraw: (animationItem) => {
                            this.onRedraw(animationItem);
                            items.onRedraw(animationItem);
                        }, object: {
                            lottie: lottieObject,
                        } });
                    break;
                default:
            }
            switch (true) {
                case type === 'meta':
                    this.metaAnimations.push(animationObject);
                    break;
                case index === null:
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
            // add up the 'totalFrames' of every animation
            this.totalFrames = this.getMaxAttributeFromAnimationsItems('totalFrames', this.animations)
                .reduce((accumulator, currentValue) => currentValue + accumulator, 0);
            this.onAdd(animationObject);
            return animationObject;
        });
    }
    onAdd(animation) {
        this.onNewAnimation(animation);
        // to be overriden
    }
    getRelativeFrame(frame) {
        return frame * this.totalFrames;
    }
    rawAnimate(items, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to, options: { fps = 120, speed = 1, } = {}, } = items;
            const inverted = to < from;
            const processedFrom = inverted ? to : from;
            const processedTo = inverted ? from : to;
            if (items.options === undefined) {
                return this.rawAnimate({
                    from: processedFrom,
                    to: processedTo,
                    options: {},
                }, callback);
            }
            if (processedFrom === processedTo) {
                callback(processedTo);
                return new Promise((resolve) => resolve());
            }
            if (this.rafId !== null) {
                cancelAnimationFrame(this.rafId);
            }
            return new Promise((resolve) => {
                let i = processedFrom;
                const step = () => {
                    callback(inverted ? processedTo - i : i);
                    if (i >= processedTo) {
                        resolve();
                        return;
                    }
                    i += (1 * speed) * (fps / 60);
                    this.rafId = window.requestAnimationFrame(step);
                };
                this.rafId = window.requestAnimationFrame(step);
            });
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
        if (this.animatorContainers.length < 1) {
            return;
        }
        const viewportHeight = this.mWindowUtility.viewport.height;
        const innerHeight = this.mWindowUtility.inner.height;
        if (viewportHeight === innerHeight) {
            this.animatorContainersWrapper.removeClass('innerCenter');
        }
        else {
            this.animatorContainersWrapper.addClass('innerCenter');
        }
        this.animatorContainers.fastEach((animatorContainer, i) => {
            if (!(this.animations
                && this.animations[i])) {
                return;
            }
            this.animations.fastEach((workingAnimations) => {
                workingAnimations.fastEach((workingAnimation) => {
                    const { __container, width, height, } = workingAnimation.items;
                    if (!__container) {
                        return;
                    }
                    let workingWidth = null;
                    let workingHeight = null;
                    workingWidth = getValueWithinRange({
                        minimum: width.minimum,
                        maximum: width.maximum,
                        value: this.mWindowUtility.inner.width,
                    });
                    workingHeight = getValueWithinRange({
                        minimum: height.minimum,
                        maximum: height.maximum,
                        value: this.mWindowUtility.inner.height,
                    });
                    __container.css('width', workingWidth == null
                        ? ''
                        : workingWidth);
                    __container.css('height', workingHeight === null
                        ? ''
                        : workingHeight);
                });
            });
        });
        lottie.resize();
        function getValueWithinRange({ minimum, maximum, value, }) {
            if (minimum === null
                || maximum === null) {
                return null;
            }
            let workingAttributeValue = null;
            if (maximum) {
                workingAttributeValue = Math.min(value, maximum);
            }
            if (minimum) {
                workingAttributeValue = Math.max(value, minimum);
            }
            return workingAttributeValue;
        }
    }
    onRedraw(animation) {
        const { respectDevicePixelRatio, object, domContent, } = animation.items;
        if (!object.lottie) {
            return;
        }
        const lottieObjectDom = domContent;
        if (respectDevicePixelRatio !== false) {
            const lottieObjectContainersWrapperWidth = this.animatorContainersWrapper.clientWidth;
            const lottieObjectContainersWrapperHeight = this.animatorContainersWrapper.clientHeight;
            const lottieObjectWidth = parseFloat(lottieObjectDom.css('width', { computed: true })) / this.resolutionMultiplier;
            const lottieObjectHeight = parseFloat(lottieObjectDom.css('height', { computed: true })) / this.resolutionMultiplier;
            const offsetWidth = -(lottieObjectWidth - lottieObjectContainersWrapperWidth) / 2;
            const offsetHeight = -(lottieObjectHeight - lottieObjectContainersWrapperHeight) / 2;
            lottieObjectDom.css({
                transform: `translate(${offsetWidth}px, ${offsetHeight}px) scale(${1 / this.resolutionMultiplier})`,
            });
        }
    }
    onFrame(frame) {
        if (!(this.animations.length > 0)) {
            return;
        }
        let animationIndex = null;
        let currentAnimationsTotalFrames = null;
        let workingAnimations = [];
        const uids = [];
        // TODO: optimize below code, use caching or something
        if (frame <= 0) {
            animationIndex = -1;
            currentAnimationsTotalFrames = 0;
            workingAnimations = this.animations[-1];
        }
        else {
            // get an array of the 'totalFrames' of every animation,
            // and then find the total frames and the index of the current animation
            const animationTotalFrames = this.getMaxAttributeFromAnimationsItems('totalFrames', this.animations);
            animationTotalFrames.reduce((accumulated, currentValue, i) => {
                const accumulating = currentValue + accumulated;
                // if the current accumulated value is more than the frame,
                // it means that we've overshot and the previous index is the current animation
                if (accumulating > frame
                    // if i is the last index in the array,
                    // we cut straight to it so it won't overshoot again and surpass this.animations
                    // because the accumulating amount won't exeed the frame
                    || i === animationTotalFrames.length - 1) {
                    if (animationIndex === null) {
                        animationIndex = i;
                        currentAnimationsTotalFrames = currentValue + accumulated;
                    }
                    return 0;
                }
                // not there yet, continue accumulating
                return accumulating;
            }, 0);
            workingAnimations = this.animations[animationIndex];
        }
        if (!workingAnimations) {
            return;
        }
        const maxOffset = Math.max(...this.getMaxAttributeFromAnimationsItems('offset', [workingAnimations]));
        const minOffset = Math.min(...this.getMinAttributeFromAnimationsItems('offset', [workingAnimations]));
        workingAnimations.fastEach((workingAnimation) => {
            const { __caller, __framesBeforeCurrent, uid, totalFrames, onFrame, offset, bezier, } = workingAnimation.items;
            // slightly faster sometimes than Array.push() https://jsben.ch/gO5B7
            uids[uids.length] = uid;
            const mBezierUtility = new BezierUtility(bezier[0], bezier[1], bezier[2], bezier[3]);
            const globalFrame = frame;
            // todo: add support for mixing -ve and +ve offsets in one instance
            let localFrame = mBezierUtility.getValue(Math.max(Math.min((((globalFrame
                - __framesBeforeCurrent) + offset)
                / ((currentAnimationsTotalFrames
                    - __framesBeforeCurrent
                // conditions below are for support of negative offsets
                ) - (maxOffset || Math.abs(minOffset)) + (maxOffset && offset))), 1), 0))
                * totalFrames;
            localFrame = Number.isNaN(localFrame) ? totalFrames : localFrame;
            if (window.DEBUG === true
                && __caller.name !== 'FrameAnimator') {
                console.log('frame', frame);
                console.log('__caller', __caller.name);
                console.log('workingAnimation', workingAnimation);
                console.log('globalFrame', globalFrame);
                console.log('animationIndex', animationIndex);
                console.log('localFrame', localFrame);
                console.log('currentAnimationsTotalFrames', currentAnimationsTotalFrames);
                console.log('this.visibleAnimations', this.visibleAnimations);
                console.log('this.animations', this.animations);
                console.log('this.totalFrames', this.totalFrames);
                console.log('');
            }
            this.currentFrame = frame;
            this.onVisibleAnimationsChange(workingAnimations);
            onFrame(workingAnimation, localFrame);
        });
        this.metaAnimations.fastEach((metaAnimation) => {
            const { onFrame, } = metaAnimation.items;
            const __framesBeforeCurrent = this.getTotalFramesBeforeIndex(animationIndex);
            const mAnimationFactory = new AnimationFactory(this);
            const animation = mAnimationFactory.create({
                type: 'meta',
                index: animationIndex,
                items: {
                    uid: uids.join(' '),
                    totalFrames: currentAnimationsTotalFrames
                        - __framesBeforeCurrent,
                },
            });
            onFrame(animation, frame - __framesBeforeCurrent);
        });
    }
    getMaxAttributeFromAnimationsItems(attributeKey, animations) {
        if (this.maxAttributeCache[attributeKey]) {
            return this.maxAttributeCache[attributeKey];
        }
        return animations.map((animation) => Math.max(...animation.map((workingAnimation) => (workingAnimation.items[attributeKey]))));
    }
    getMinAttributeFromAnimationsItems(attributeKey, animations) {
        if (this.minAttributeCache[attributeKey]) {
            return this.minAttributeCache[attributeKey];
        }
        return animations.map((animation) => Math.min(...animation.map((workingAnimation) => (workingAnimation.items[attributeKey]))));
    }
    getTotalFramesBeforeIndex(index) {
        const totalFrames = this.getMaxAttributeFromAnimationsItems('totalFrames', this.animations);
        let previousFrames = null;
        totalFrames.reduce((accumulator, currentValue, i) => {
            if (i >= index) {
                if (previousFrames === null) {
                    previousFrames = accumulator;
                }
                return 0;
            }
            if (i + 1 === index) {
                previousFrames = currentValue + accumulator;
            }
            // not there yet, continue accumulating
            return currentValue + accumulator;
        }, 0);
        return previousFrames;
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
    seekToUid(targetUid) {
        const handler = (workingAnimations, i) => {
            workingAnimations.fastEach((workingAnimation) => {
                const { uid, } = workingAnimation.items;
                if (uid !== targetUid) {
                    return;
                }
                const frame = this.getTotalFramesBeforeIndex(i + 1);
                this.onSeek(Math.max(frame - 1, 0));
            });
        };
        if (this.animations[-1]) {
            handler(this.animations[-1], -1);
        }
        this.animations.fastEach(handler);
    }
    seekTo(frame) {
        this.onSeek(frame);
        this.onFrame(frame);
    }
    onSeek(frame) {
        this.onFrame(frame);
        // to be overriden
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
CoreAnimator.PREFIX = '__animate';
//# sourceMappingURL=core.animator.js.map