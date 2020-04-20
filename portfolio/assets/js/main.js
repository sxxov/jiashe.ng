var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $, $$, BezierUtility } from '../../../assets/js/resources/utilities.js';
import { FrameAnimator } from '../../../assets/js/resources/animators.js';
const { marked, Darkmode, } = window;
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
        this.clickFrameAnimator = new FrameAnimator();
        this.currentOnClickDom = null;
        this.mBezierUtility = new BezierUtility(0.075, 0.82, 0.165, 1);
        this.darkMode = new Darkmode();
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            this.skinDom.innerHTML = marked(yield (yield fetch(this.uri)).text());
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
                window.location.href = `/${window.location.href.substr(window.location.href.indexOf('#'))}`;
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
        uri += uri.substr(-3) === '.md' ? '' : '.md';
        uri = `/assets/md/${uri}`;
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
        const delta = event.deltaY + event.deltaX;
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
            this.preventScrollEvent = true;
            switch (true) {
                case delta < 0: {
                    if (i < delta) {
                        this.preventScrollEvent = false;
                        return;
                    }
                    i -= 2;
                    break;
                }
                case delta > 0: {
                    if (i > delta) {
                        this.preventScrollEvent = false;
                        return;
                    }
                    i += 2;
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