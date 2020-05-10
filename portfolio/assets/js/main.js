var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { OhHiMark } from './core/ohHiMark.js';
import { $, $$ } from '../../../assets/js/resources/utilities.js';
import { FrameAnimator } from '../../../assets/js/resources/animators.js';
import { 
// @dependent: 11052020/6
SmoothScroll, 
// @dependent: 11052020/1
wheel, 
// @dependent: 11052020/5
wheelEvent, } from '../../../assets/js/raw/libraries/smoothscroll.js';
const { Darkmode, } = window;
class Main {
    constructor() {
        this.skinDom = $('.skin');
        this.cachedScroll = {
            x: 0,
            y: 0,
        };
        this.clickFrameAnimator = new FrameAnimator();
        this.currentOnClickDom = null;
        this.darkMode = new Darkmode();
        this.isHorizontallyScrolling = null;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            this.skinDom.innerHTML = yield OhHiMark.createFromUrl(this.uri);
            // @dependent: 11052020/6
            SmoothScroll({
                animationTime: 500,
                touchpadSupport: false,
                pulseScale: 6,
            });
            // @dependent: 11052020/1, 11052020/5
            window.removeEventListener(wheelEvent, wheel);
            $(window)
                .on(
            // @dependent: 11052020/5
            wheelEvent, (event) => this.onVerticalScroll.call(this, event), { passive: false });
            $(window)
                .on('scroll', () => {
                this.onScroll.call(this);
            });
            $(window)
                .on('load resize', () => {
                this.isHorizontallyScrolling = getComputedStyle(document.body).overflowY === 'hidden';
            });
            this.clickFrameAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    totalFrames: 30,
                    onFrame: (animation, frame) => {
                        const domContent = this.currentOnClickDom;
                        const { totalFrames, } = animation.items;
                        domContent.css({
                            opacity: Math.ceil((totalFrames - frame) / 3) % 4 ? 0 : 1,
                        });
                    },
                },
            });
            $('.header.container.logo').on('click', (event) => __awaiter(this, void 0, void 0, function* () {
                yield this.onClick(event);
                // if is on domain or access through an ip
                if (!(document.referrer.includes('jiashe.ng')
                    || parseInt(document.referrer.substring(
                    // start from http://
                    document.referrer.indexOf('//') + 2, 
                    // end at first /
                    document.referrer.replace('//', '__').indexOf('/')), 10))) {
                    // temp solution for sub-domains
                    const indexOfAssets = this.uri.indexOf('assets');
                    let subdomain = '';
                    if (indexOfAssets > 1) {
                        subdomain = this.uri
                            .substr(0, indexOfAssets)
                            .split('/')
                            .filter((substring) => substring.length !== 0)
                            .reverse()
                            .join('.');
                    }
                    window.location.href = `https://${subdomain}${subdomain ? '.' : ''}jiashe.ng`;
                    return;
                }
                window.history.back();
            }));
            $('.header.container.night').on('click', (event) => __awaiter(this, void 0, void 0, function* () {
                this.onClick(event);
                this.darkMode.toggle();
            }));
        });
    }
    get uri() {
        let uri = String(window.location.href);
        uri = uri.substr(uri.indexOf('#') + 1);
        uri = !uri.includes('_') ? uri : uri.replace(/_/g, '/');
        uri = !uri.includes('//') ? uri : uri.replace(/\/\//g, '_');
        uri += uri.substr(-3) === '.md' ? '' : '.md';
        uri = decodeURIComponent(uri);
        return uri;
    }
    onClick(event) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentOnClickDom = $(event.currentTarget);
            yield this.clickFrameAnimator.animate(0, 30);
        });
    }
    onScroll() {
        const { scrollY, scrollX, } = window;
        const { x, y, } = this.cachedScroll;
        this.cachedScroll = {
            x: scrollX,
            y: scrollY,
        };
        if (scrollX - x > 0
            || scrollY - y > 0) {
            $$('.header.container.logo, .header.container.night').fastEach((node) => node.removeClass('active'));
            return;
        }
        $$('.header.container.logo, .header.container.night').fastEach((node) => node.addClass('active'));
    }
    onVerticalScroll(event) {
        const deltaY = -event.wheelDeltaY;
        // invert deltas when the page is horizonal
        if (this.isHorizontallyScrolling) {
            // @dependent: 11052020/1, 11052020/2, 11052020/3
            wheel(event, deltaY, -0);
            return;
        }
        // @dependent: 11052020/1, 11052020/2, 11052020/3
        wheel(event, -0, deltaY);
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    (new Main()).create();
}))();
//# sourceMappingURL=main.js.map