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
        this.animatorClassPrefix = '__animate';
        this.animatorContainers = [];
        this.animatorContainersWrapper = null;
        this.visibleAnimations = null;
        this.dpr = Math.max(window.devicePixelRatio / 2, 1);
        this.dprMultiplier = this.dpr;
        this.rafId = null;
        this.attributeCache = {};
        this.createContainersWrapperDom();
        $(window).on('load resize', () => window.requestAnimationFrame(() => {
            this.onWindowResize.call(this);
            if (this.visibleAnimations !== null) {
                this.visibleAnimations.forEach((animation) => {
                    animation.items.onRedraw.call(this, animation);
                });
            }
        }));
    }
    createContainersWrapperDom() {
        this.animatorContainersWrapper = $(document.createElement('div'));
        this.animatorContainersWrapper.addClass([
            this.animatorClassPrefix,
            'containersWrapper',
            this.uid,
            'height',
        ]);
        this.activate(this.animatorContainersWrapper);
        $('.organs').appendChild(this.animatorContainersWrapper);
    }
    add(animationToBeConstructed) {
        return __awaiter(this, void 0, void 0, function* () {
            const mAnimationFactory = new AnimationFactory(this);
            const animationObject = mAnimationFactory.create(animationToBeConstructed, this);
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
            this.attributeCache = {};
            // add up the 'totalFrames' of every animation
            this.totalFrames = this.getAttributeFromAnimationsItems('totalFrames', this.animations)
                .reduce((accumulator, currentValue) => currentValue + accumulator, 0);
            this.onAdd(animationObject);
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
            const { from, to, options: { fps = 120, } = {}, } = items;
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
            // let processedCallback = callback;
            // if (bezier !== []
            // 	&& bezier.length === 4) {
            // 	const mBezierUtility = new BezierUtility(
            // 		bezier[0], bezier[1], bezier[2], bezier[3],
            // 	);
            // 	processedCallback = (frame): void => callback(
            // 		mBezierUtility.getValue(
            // 			// offset frame so it starts from 'from'
            // 			(frame - processedFrom)
            // 			// divide by, the amount of frames in between 'to' & 'from'
            // 			/ (processedTo - processedFrom),
            // 		// times it all back with, the amount of frames in between 'to' & 'from',
            // 		// after getting the bezier-altered value
            // 		) * (processedTo - processedFrom),
            // 	);
            // }
            return new Promise((resolve) => {
                let i = processedFrom;
                const step = () => {
                    // processedCallback(i);
                    callback(inverted ? processedTo - i : i);
                    if (i >= processedTo) {
                        resolve();
                        return;
                    }
                    i += 1 * (fps / 60);
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
        if (!this.animatorContainers) {
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
            const lottieObjectWidth = parseFloat(lottieObjectDom.css('width', { computed: true })) / this.dprMultiplier;
            const lottieObjectHeight = parseFloat(lottieObjectDom.css('height', { computed: true })) / this.dprMultiplier;
            const offsetWidth = -(lottieObjectWidth - lottieObjectContainersWrapperWidth) / 2;
            const offsetHeight = -(lottieObjectHeight - lottieObjectContainersWrapperHeight) / 2;
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
        let workingAnimations = [];
        const uids = [];
        // TODO: optimize below code, use caching or something
        if (frame === 0) {
            animationIndex = -1;
            currentAnimationsTotalFrames = 0;
            workingAnimations = this.animations[-1];
        }
        else {
            // get an array of the 'totalFrames' of every animation,
            // and then find the total frames and the index of the current animation
            const animationTotalFrames = this.getAttributeFromAnimationsItems('totalFrames', this.animations);
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
        const maxOffset = Math.max(...this.getAttributeFromAnimationsItems('offset', this.animations));
        workingAnimations.forEach((workingAnimation) => {
            const { __caller, uid, totalFrames, onFrame, offset, bezier, } = workingAnimation.items;
            // if (frame < offset) {
            // 	return;
            // }
            uids.push(uid);
            const mBezierUtility = new BezierUtility(bezier[0], bezier[1], bezier[2], bezier[3]);
            const globalFrame = frame;
            const localFrame = mBezierUtility.getValue(Math.min((((globalFrame - this.getTotalFramesBeforeIndex(animationIndex))
                / ((currentAnimationsTotalFrames
                    - this.getTotalFramesBeforeIndex(animationIndex)) - maxOffset + offset))
                * (totalFrames)), totalFrames) / totalFrames) * totalFrames || totalFrames;
            if (__caller.name !== 'FrameAnimator'
                || uid === 'logo'
                || uid === 'scrollCounter'
                || uid.indexOf('char') !== -1) {
                console.log('frame', frame);
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
        this.metaAnimations.forEach((metaAnimation) => {
            const { onFrame, } = metaAnimation.items;
            const mAnimationFactory = new AnimationFactory(this);
            const animation = mAnimationFactory.create({
                type: 'meta',
                index: animationIndex,
                items: {
                    uid: uids.join(' '),
                    totalFrames: currentAnimationsTotalFrames
                        - this.getTotalFramesBeforeIndex(animationIndex),
                },
            }, this);
            onFrame(animation, frame - this.getTotalFramesBeforeIndex(animationIndex));
        });
    }
    getAttributeFromAnimationsItems(attributeKey, animations) {
        if (this.attributeCache[attributeKey]) {
            return this.attributeCache[attributeKey];
        }
        return animations.map((animation) => Math.max(...animation.map((workingAnimation) => (workingAnimation.items[attributeKey]))));
    }
    getTotalFramesBeforeIndex(index) {
        const totalFrames = this.getAttributeFromAnimationsItems('totalFrames', this.animations);
        let previousFrames = null;
        totalFrames.reduce((accumulator, currentValue, i) => {
            if (i >= index) {
                if (previousFrames === null) {
                    previousFrames = accumulator;
                }
                return 0;
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
        this.animations.fastEach((workingAnimations, i) => {
            workingAnimations.fastEach((workingAnimation) => {
                const { uid, } = workingAnimation.items;
                if (uid !== targetUid) {
                    return;
                }
                const frame = this.getTotalFramesBeforeIndex(i);
                this.onSeek(frame);
            });
        });
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
//# sourceMappingURL=core.animator.js.map