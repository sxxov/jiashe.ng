var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { lottie } from '../resources/lottie.js';
import { $, WindowUtility, } from '../resources/utilities.js';
export class Hamburger {
    constructor() {
        this.lottieAnim = null;
        this.playDirection = -1;
        this.containerDom = $('.hamburgerContainer');
        this.organsDom = $('.organs');
        this.skinDom = $('.skin');
        this.mWindowUtility = new WindowUtility();
        this.amount = null;
        this.setAmount();
        $(window).on('resize', () => window.requestAnimationFrame(() => this.onWindowResize.call(this)));
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.data = data;
            this.containerDom.on('click', () => {
                this.onClick.call(this);
            });
            this.addLottie();
            this.setCss();
        });
    }
    addLottie() {
        this.lottieAnim = lottie.loadAnimation({
            container: this.containerDom,
            renderer: 'canvas',
            autoplay: false,
            animationData: this.data,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMin meet',
                className: 'hamburger',
            },
        });
    }
    getDimentions(amountLess) {
        const windowHeight = Math.min(this.mWindowUtility.viewport.height, this.mWindowUtility.inner.height);
        const windowWidth = Math.min(this.mWindowUtility.viewport.width, this.mWindowUtility.inner.width);
        // const height = windowHeight - amountLess;
        // const width = windowWidth - amountLess;
        const height = 0;
        const width = windowWidth;
        const top = (windowHeight - height) / 2;
        const left = (windowWidth - width) / 2;
        return {
            height,
            width,
            top,
            left,
        };
    }
    get isOpen() {
        return this.playDirection === -1;
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            return $().getJSON('/assets/js/raw/lottie/hamburger.json');
        });
    }
    onClick() {
        this.playDirection *= -1;
        this.lottieAnim.setDirection(this.playDirection);
        this.lottieAnim.play();
        this.setCss();
    }
    setAmount() {
        this.amount = ((20 + this.mWindowUtility.vw(2)) * 2) + 100;
    }
    setCss() {
        const windowHeight = Math.min(this.mWindowUtility.viewport.height, this.mWindowUtility.inner.height);
        const windowWidth = Math.min(this.mWindowUtility.viewport.width, this.mWindowUtility.inner.width);
        const height = 1;
        const width = 0;
        const top = (windowHeight - height) / 2;
        const left = (windowWidth - width) / 2;
        if (this.isOpen) {
            this.skinDom.css({
                height: '',
                width: '',
                top: 0,
                left: 0,
            });
            this.organsDom.css({
                height: '',
                width: '',
                top: 0,
                left: 0,
            });
            $(document.body).css({
                overflow: '',
            });
            return;
        }
        this.skinDom.css({
            height,
            width,
            top,
            left,
        });
        this.organsDom.css({
            height: height + top,
            width: width + left,
            top: -top,
            left: -left,
        });
        $(document.body).css({
            overflow: 'hidden',
        });
    }
    onWindowResize() {
        this.setAmount();
        this.setCss();
    }
}
//# sourceMappingURL=hamburger.js.map