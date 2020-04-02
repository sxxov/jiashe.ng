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
import { $, WindowUtility, PromiseQueueUtility, } from '../../utilities.js';
import { lottie } from '../../../raw/libraries/lottie.js';
import { upgradeElement, } from '../../../raw/libraries/workerdom/main.js';
export class LottieFactory {
    constructor(thisArg) {
        this.mWindowUtility = new WindowUtility();
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
                        : this.ctx.dpr * this.ctx.dprMultiplier,
                    preserveAspectRatio: 'xMidYMid slice',
                    className: `${CoreAnimator.PREFIX} ${className} hidden`,
                },
            });
            yield $(animation).on('DOMLoaded', () => new Promise((resolve) => resolve));
            const domContent = $(`.${CoreAnimator.PREFIX}.${className}`);
            const totalFrames = (animationObject.items.totalFrames
                || animation.getDuration(true));
            let isCacheAvailable = false;
            const canvasCtx = domContent.getContext('2d');
            let cache = null;
            this.prerender({
                animation,
                totalFrames,
                domContent,
                onFrame: null,
            }).then((result) => {
                console.log(result);
                cache = result.map((imageBitmap) => {
                    const imageBitmapCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
                    imageBitmapCanvas
                        .getContext('bitmaprenderer')
                        .transferFromImageBitmap(imageBitmap);
                    imageBitmap.close();
                    return imageBitmapCanvas;
                });
                const windowWidth = this.mWindowUtility.viewport.width;
                const windowHeight = this.mWindowUtility.viewport.height;
                // const scale = Math.max(windowWidth, windowHeight) / Math.min(windowWidth, windowHeight);
                const offsetX = -((cache[0].width - windowWidth) / 2);
                const offsetY = -((cache[0].height - windowHeight) / 2);
                canvasCtx.setTransform(1, // scale X
                0, // skew Y
                0, // skew X
                1, // scale Y
                offsetX, // translate X
                offsetY);
                isCacheAvailable = true;
            });
            const onFrame = (animationItem, frame) => {
                if (isCacheAvailable) {
                    canvasCtx.clearRect(0, 0, 99999, 99999);
                    canvasCtx.drawImage(cache[Math.round(frame)], 0, 0);
                    // console.log(cache[Math.round(frame)], Math.round(frame));
                    return;
                }
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
    prerender(lottieObject) {
        return __awaiter(this, void 0, void 0, function* () {
            return PromiseQueueUtility.enqueue(() => __awaiter(this, void 0, void 0, function* () {
                const mWorker = yield upgradeElement(yield this.getPlayground(), '/assets/js/raw/libraries/workerdom/worker/worker.js');
                mWorker.postMessage({
                    name: 'create',
                    animationData: JSON.stringify(lottieObject.animation.animationData),
                    parameters: {
                        width: this.mWindowUtility.viewport.width,
                        height: this.mWindowUtility.viewport.height,
                    },
                });
                yield new Promise((resolve) => $(mWorker).on('message', (event) => event.data.name === 'create' && resolve()));
                mWorker.postMessage({
                    name: 'prerender',
                    parameters: {
                        until: lottieObject.totalFrames,
                    },
                });
                return new Promise((resolve) => $(mWorker).on('message', (event) => event.data.name === 'cache' && resolve(event.data.cache)));
            }));
        });
    }
    getPlayground() {
        return __awaiter(this, void 0, void 0, function* () {
            const $domContent = $('.painting > .playground');
            if ($domContent) {
                return $domContent;
            }
            const domContent = document.createElement('div');
            const lottieLibraryFileContent = (yield (yield fetch('/assets/js/raw/libraries/lottie.js')).text()).replace('export { lottie };', '');
            const lottieFactoryWorkerFileContent = yield (yield fetch('/assets/js/resources/animators/factories/lottie.factory.worker.js')).text();
            domContent.classList.add('playground');
            domContent.setAttribute('src', URL.createObjectURL(new Blob([lottieLibraryFileContent + lottieFactoryWorkerFileContent])));
            $('.painting').appendChild(domContent);
            return $(domContent);
        });
    }
}
//# sourceMappingURL=lottie.factory.js.map