var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// eslint-disable-next-line no-var
var lottie = lottie;
class LottieFactoryWorker {
    constructor() {
        globalThis.onmessage = (event) => this.onMessage.call(this, event);
    }
    onMessage(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!event.data) {
                return;
            }
            const { name = '', } = event.data;
            switch (name.toLowerCase()) {
                case 'create': {
                    this.create(event)
                        .then((result) => this.reply(result));
                    break;
                }
                case 'prerender': {
                    this.prerender(event)
                        .then((result) => this.reply(result));
                    break;
                }
                case 'play': {
                    this.animation.play();
                    break;
                }
                case 'ping': {
                    this.reply({
                        name: 'pong',
                    });
                    console.log('pong');
                    break;
                }
                default:
            }
        });
    }
    create(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const animationData = JSON.parse(event.data.animationData);
            const { width: baseWidth, height: baseHeight, } = event.data.parameters;
            // const scale = (
            // 	width / height
            // 	> animationData.w / animationData.h
            // )
            // 	? height / animationData.h
            // 	: width / animationData.w;
            let width = null;
            let height = null;
            if (baseWidth / baseHeight
                > animationData.w / animationData.h) {
                width = baseWidth;
                height = baseWidth * (animationData.h / animationData.w);
            }
            else {
                width = baseHeight * (animationData.w / animationData.h);
                height = baseHeight;
            }
            this.canvas = new OffscreenCanvas(width, height);
            const context = this.canvas.getContext('2d');
            context.setTransform(1, // scale X
            0, // skew Y
            0, // skew X
            1, // scale Y
            0, // translate X
            0);
            console.log(width, height);
            this.animation = lottie.loadAnimation(Object.assign(Object.assign({ loop: false, autoplay: false }, event.data), { canvas: undefined, animationData, rendererSettings: Object.assign(Object.assign({ clearCanvas: true }, event.data.rendererSettings), { context }), renderer: 'canvas' }));
            return {
                name: 'create',
            };
        });
    }
    prerender(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = [];
            for (let i = 0, l = event.data.parameters.until; i <= l; ++i) {
                this.animation.goToAndStop(i, true);
                cache[i] = this.canvas.transferToImageBitmap();
            }
            return {
                name: 'cache',
                cache,
            };
        });
    }
    reply(data) {
        if (!data) {
            return;
        }
        console.log('reply:', data);
        globalThis.postMessage(data);
    }
}
new LottieFactoryWorker();
//# sourceMappingURL=lottie.factory.worker.js.map