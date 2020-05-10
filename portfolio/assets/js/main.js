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
import { $, $$, BezierUtility } from '../../../assets/js/resources/utilities.js';
import { FrameAnimator } from '../../../assets/js/resources/animators.js';
import { SmoothScroll, } from '../../../assets/js/raw/libraries/smoothscroll.js';
const { Darkmode, } = window;
class Main {
    constructor() {
        this.skinDom = $('.skin');
        this.expectedScrollLeft = window.scrollX;
        this.cachedScrollLeft = null;
        this.scrollRafId = null;
        this.preventScrollEvent = false;
        this.cachedScroll = {
            x: 0,
            y: 0,
        };
        this.scrollVelocity = 1;
        this.clickFrameAnimator = new FrameAnimator();
        this.currentOnClickDom = null;
        this.mBezierUtility = new BezierUtility(0, 0.55, 0.45, 1);
        this.darkMode = new Darkmode();
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            this.skinDom.innerHTML = yield OhHiMark.createFromUrl(this.uri);
            SmoothScroll({
                animationTime: 500,
                touchpadSupport: true,
                pulseScale: 6,
            });
            $(document.scrollingElement || document.documentElement)
                .on('wheel', (event) => this.onVerticalScroll.call(this, event));
            $(window)
                .on('scroll', () => {
                this.onScroll.call(this);
                if (this.preventScrollEvent) {
                    return;
                }
                this.expectedScrollLeft = window.scrollX;
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
        if (!event.deltaY) {
            return;
        }
        if (Math.sign(this.scrollVelocity) !== Math.sign(event.deltaY)) {
            this.scrollVelocity = 0;
        }
        this.scrollVelocity += Math.sign(event.deltaY) / 10;
        this.scrollVelocity = Math.sign(this.scrollVelocity)
            * Math.max(Math.min(Math.abs(this.scrollVelocity), 5), 1);
        // firefox has deltas of like 6-9, so just use chrome's current behaviour of snapping every 100
        const delta = Math.sign(event.deltaY) * 100 * Math.abs(this.scrollVelocity) + event.deltaX;
        cancelAnimationFrame(this.scrollRafId);
        const currentTarget = $(event.currentTarget);
        currentTarget.scrollLeft = this.expectedScrollLeft;
        if (currentTarget.scrollLeft !== this.expectedScrollLeft) {
            this.expectedScrollLeft = Number(currentTarget.scrollLeft);
            this.preventScrollEvent = false;
            return;
        }
        this.cachedScrollLeft = this.expectedScrollLeft;
        this.expectedScrollLeft += delta;
        let i = 0;
        const handler = () => {
            const magic = this.mBezierUtility.getValue((Math.abs(i))
                / Math.abs(delta)) * delta;
            const absoluteScrollVelocity = Math.abs(this.scrollVelocity);
            if (Math.floor(absoluteScrollVelocity) === 0) {
                return;
            }
            this.preventScrollEvent = true;
            switch (true) {
                case delta < 0: {
                    if (i < delta) {
                        this.scrollVelocity = 1;
                        this.preventScrollEvent = false;
                        return;
                    }
                    i -= 2 * absoluteScrollVelocity;
                    if (i <= Math.floor(delta / 2)) {
                        this.scrollVelocity -= Math.sign(this.scrollVelocity) / 2;
                    }
                    break;
                }
                case delta > 0: {
                    if (i > delta) {
                        this.scrollVelocity = 1;
                        this.preventScrollEvent = false;
                        return;
                    }
                    i += 2 * absoluteScrollVelocity;
                    if (i >= Math.floor(delta / 2)) {
                        this.scrollVelocity -= Math.sign(this.scrollVelocity) / 2;
                    }
                    break;
                }
                default: {
                    return;
                }
            }
            currentTarget.scrollLeft = magic + this.cachedScrollLeft;
            this.scrollRafId = requestAnimationFrame(() => handler());
        };
        this.scrollRafId = requestAnimationFrame(() => handler());
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    (new Main()).create();
}))();
//# sourceMappingURL=main.js.map