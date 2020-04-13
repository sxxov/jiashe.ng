var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $, $$, WindowUtility } from '../resources/utilities.js';
import Swiper from '../raw/libraries/swiper/swiper.js';
import { FrameAnimator } from '../resources/animators.js';
export class TV {
    constructor() {
        this.swiper = null;
        this.screenDomSelector = '.screen';
        this.screenDom = $(this.screenDomSelector);
        this.clickFrameAnimator = new FrameAnimator();
        this.currentOnClickDom = null;
        this.mouseCatcherDom = $('.mouseCatcher');
        this.mWindowUtility = new WindowUtility();
        this.cachedMousePosition = null;
        this.mouseCatcherScaleResetTimeoutId = null;
        this.mouseCatcherOverrideScale = false;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            $(window).on('load resize', () => this.onWindowResize.call(this));
            if (document.readyState === 'loading') {
                yield new Promise((resolve) => $(window).on('load', resolve));
            }
            this.swiper = new Swiper(this.screenDomSelector, {
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                loop: true,
                autoplay: {
                    delay: 5000,
                },
                speed: 500,
                hashNavigation: {
                    watchState: true,
                },
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
            $('.swiper-button-next').on('click', (event) => this.onClick.call(this, event));
            $('.swiper-button-prev').on('click', (event) => this.onClick.call(this, event));
            if (this.mWindowUtility.isMobile) {
                return;
            }
            this.mouseCatcherDom.removeClass('hidden');
            $(document).on('mousemove', (event) => this.onMouseMove.call(this, event));
            $$('*').fastEach((node) => node
                .on('mouseenter', (event) => {
                if ($(event.target).css('cursor', { computed: true }) !== 'pointer') {
                    this.mouseCatcherOverrideScale = false;
                    return;
                }
                this.mouseCatcherOverrideScale = true;
                clearTimeout(this.mouseCatcherScaleResetTimeoutId);
                this.mouseCatcherDom.css({
                    transform: 'scale(1)',
                });
            }));
        });
    }
    onWindowResize() {
        const viewportHeight = this.mWindowUtility.viewport.height;
        const innerHeight = this.mWindowUtility.inner.height;
        if (viewportHeight === innerHeight) {
            this.screenDom.removeClass('innerCenter');
        }
        else {
            this.screenDom.addClass('innerCenter');
        }
    }
    onMouseMove(event) {
        const { clientX, clientY, } = event;
        if (this.cachedMousePosition === null) {
            this.cachedMousePosition = {
                clientX,
                clientY,
            };
        }
        const { clientX: cachedClientX, clientY: cachedClientY, } = this.cachedMousePosition;
        this.mouseCatcherDom.css({
            left: clientX - 64,
            top: clientY - 64,
            transform: this.mouseCatcherOverrideScale ? '' : `scale(${Math.min(Math.max(Math.abs(clientX - cachedClientX), Math.abs(clientY - cachedClientY)) / 5, 5)})`,
        });
        this.cachedMousePosition = {
            clientX,
            clientY,
        };
        clearTimeout(this.mouseCatcherScaleResetTimeoutId);
        this.mouseCatcherScaleResetTimeoutId = !this.mouseCatcherOverrideScale && setTimeout(() => {
            this.mouseCatcherDom.css({
                transform: 'scale(0.1)',
            });
        }, 500);
    }
    onClick(event) {
        const { currentTarget, } = event;
        this.currentOnClickDom = $(currentTarget);
        this.clickFrameAnimator.animate(0, 30);
    }
}
//# sourceMappingURL=tv.js.map