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
import { Placeholderer } from './placeholderer.js';
export class TV {
    constructor() {
        this.swiper = null;
        this.screenDomSelector = '.screen';
        this.screenDom = $(this.screenDomSelector);
        this.clickFrameAnimator = new FrameAnimator();
        this.currentOnClickDom = null;
        this.mouseCatcherDom = $('.mouseCatcher');
        this.mWindowUtility = new WindowUtility();
        this.mPlaceholderer = new Placeholderer();
        this.cachedMousePosition = null;
        this.mouseCatcherScaleResetTimeoutId = null;
        this.mouseCatcherOverrideScale = false;
        this.splashDoms = [];
    }
    create(docs) {
        return __awaiter(this, void 0, void 0, function* () {
            $(window).on('resize', () => this.onWindowResize.call(this));
            this.onWindowResize();
            if (document.readyState === 'loading') {
                yield new Promise((resolve) => $(window).on('load', resolve));
            }
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
            yield this.createChannels(docs);
            this.swiper = this.createSwiper();
            if (this.mWindowUtility.isMobile) {
                return;
            }
            this.createMouseChaser();
            this.createSplash();
            $(document).on('mousemove', (event) => this.onMouseMove.call(this, event));
        });
    }
    createChannels(docs) {
        return __awaiter(this, void 0, void 0, function* () {
            yield docs.forAwait((doc, i) => __awaiter(this, void 0, void 0, function* () {
                const { date, title, subtitle, images, description, } = doc.data();
                const wrapperDom = $('.swiper-wrapper');
                const containerDom = $(document.createElement('div'));
                containerDom.addClass([
                    'swiper-slide',
                    'channel',
                    'container',
                ]);
                containerDom.setAttribute('data-swiper-slide-index', i.toString());
                containerDom.setAttribute('data-hash', title.replace(/\s/g, '_'));
                const imageDom = $(document.createElement('img'));
                imageDom.addClass([
                    'channel',
                    'splash',
                ]);
                [imageDom.src] = images;
                const titleDom = $(document.createElement('h1'));
                titleDom.addClass([
                    'channel',
                    'title',
                    'white',
                ]);
                titleDom.textContent = title;
                const subtitleDom = $(document.createElement('p'));
                subtitleDom.addClass([
                    'channel',
                    'subtitle',
                    'white',
                ]);
                subtitleDom.textContent = subtitle;
                wrapperDom.appendChild(containerDom);
                containerDom.appendChild(imageDom);
                containerDom.appendChild(titleDom);
                containerDom.appendChild(subtitleDom);
                yield new Promise((resolve) => imageDom.on('load', resolve));
                // activate the container after 100ms for the animation to kick in
                setTimeout(() => this.screenDom.addClass('active'), 100);
            }));
            $('.pace > .pace-activity').addClass('deactivated');
        });
    }
    createSplash() {
        this.splashDoms = $$('.channel.container > .splash');
    }
    createSwiper() {
        return new Swiper(this.screenDomSelector, {
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            loop: true,
            // if the page was refered with a #, disable autoplay
            autoplay: !window.location.href.includes('#') && {
                delay: 5000,
            },
            speed: 500,
            hashNavigation: {
                watchState: true,
            },
        });
    }
    createMouseChaser() {
        this.mouseCatcherDom.removeClass('hidden');
        $$('*').fastEach((node) => node
            .on('mouseenter', (event) => {
            if ($(event.target).css('cursor', { computed: true }) !== 'pointer') {
                this.mouseCatcherOverrideScale = false;
                return;
            }
            this.mouseCatcherOverrideScale = true;
            clearTimeout(this.mouseCatcherScaleResetTimeoutId);
            const magic = 256;
            this.mouseCatcherDom.css({
                margin: `${-magic / 2}px 0px 0px ${-magic / 2}px`,
                height: magic,
                width: magic,
            });
        }));
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
        const unit = 128;
        const differenceX = Math.abs(clientX - cachedClientX);
        const differenceY = Math.abs(clientY - cachedClientY);
        const scaleFactor = 30;
        const magic = Math.max(Math.min(Math.max(differenceX, differenceY) * scaleFactor, unit * 3), unit / 2);
        if (!this.mouseCatcherOverrideScale) {
            this.mouseCatcherDom.css({
                left: clientX,
                top: clientY,
                margin: `${-magic / 2}px 0px 0px ${-magic / 2}px`,
                height: magic,
                width: magic,
            });
        }
        this.cachedMousePosition = {
            clientX,
            clientY,
        };
        clearTimeout(this.mouseCatcherScaleResetTimeoutId);
        this.mouseCatcherScaleResetTimeoutId = !this.mouseCatcherOverrideScale && setTimeout(() => {
            this.mouseCatcherDom.css({
                margin: `${-unit / 4}px 0px 0px ${-unit / 4}px`,
                height: unit / 2,
                width: unit / 2,
            });
        }, 500);
        this.splashDoms.fastEach((splashDom) => {
            splashDom.css({
                transform: `translate(${(clientX - this.mWindowUtility.vw(50)) / 10}px, ${(clientY - this.mWindowUtility.vh(50)) / 10}px)`,
            });
        });
    }
    onClick(event) {
        const { currentTarget, } = event;
        this.currentOnClickDom = $(currentTarget);
        this.clickFrameAnimator.animate(0, 30);
    }
}
//# sourceMappingURL=tv.js.map