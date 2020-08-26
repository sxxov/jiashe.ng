import Swiper from 'swiper';
import { $, $$, WindowUtility } from '../resources/utilities';
import { FrameAnimator } from '../resources/animators';
export class TV {
    constructor() {
        this.swiper = null;
        this.screenDomSelector = '.screen';
        this.screenDom = $(this.screenDomSelector);
        this.clickFrameAnimator = new FrameAnimator();
        this.currentOnClickDom = null;
        this.mouseCatcherDom = $('.mouseCatcher');
        this.cachedMousePosition = null;
        this.mouseCatcherScaleResetTimeoutId = null;
        this.mouseCatcherOverrideScale = false;
        this.splashDoms = [];
    }
    async create(docs) {
        $(window).on('resize', () => this.onWindowResize.call(this));
        this.onWindowResize();
        if (document.readyState === 'loading') {
            await new Promise((resolve) => $(window).on('load', resolve));
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
        $('.swiper-button-next').on('click', (event) => {
            this.swiper.slideNext();
            this.onClick.call(this, event);
        });
        $('.swiper-button-prev').on('click', (event) => {
            this.swiper.slidePrev();
            this.onClick.call(this, event);
        });
        await this.createChannels(docs);
        this.swiper = this.createSwiper(docs.length);
        this.createTitleClicks();
        if (WindowUtility.isMobile) {
            return;
        }
        this.createMouseChaser();
        this.createSplashParallax();
        $(document).on('mousemove', (event) => this.onMouseMove.call(this, event));
    }
    async createChannels(docs) {
        if (docs.length === 0) {
            $('.pace > .pace-activity').addClass('deactivated');
            return;
        }
        await docs.forAwait(async (doc, i) => {
            const { title, subtitle, splash, markdown, } = doc;
            const wrapperDom = $('.swiper-wrapper');
            const containerDom = $(document.createElement('div'));
            containerDom.addClass([
                'swiper-slide',
                'channel',
                'container',
            ]);
            containerDom.setAttribute('data-swiper-slide-index', i.toString());
            containerDom.setAttribute('data-hash', title.replace(/\s/g, '_'));
            containerDom.setAttribute('data-markdown-url', markdown);
            const imageDom = $(document.createElement('img'));
            imageDom.addClass([
                'channel',
                'splash',
            ]);
            imageDom.src = splash;
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
            // activate the container after 100ms for the animation to kick in
            setTimeout(() => this.screenDom.addClass('active'), 100);
            if (!imageDom.complete) {
                imageDom.on('load', () => $('.pace > .pace-activity').addClass('deactivated'));
                return;
            }
            $('.pace > .pace-activity').addClass('deactivated');
        });
    }
    createTitleClicks() {
        $$('.channel.title')
            .fastEach((titleDom) => {
            titleDom.on('click', async (event) => {
                const url = titleDom.parentElement.getAttribute('data-markdown-url');
                await this.onClick.call(this, event);
                this.redirectToMarkdownViewer(url);
            });
        });
    }
    createSplashParallax() {
        this.splashDoms = $$('.channel.container > .splash');
    }
    createSwiper(length) {
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
            autoplay: !(window.location.href.includes('#') || length <= 1) && {
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
    redirectToMarkdownViewer(url) {
        let uri = url;
        // narrow down to filename only if possible
        uri = !uri.includes('_') ? uri : uri.replace(/_/g, '__');
        uri = !uri.includes('/') ? uri : uri.replace(/\//g, '_');
        uri = !uri.includes('.md') ? uri : uri.substr(0, uri.indexOf('.md'));
        window.location.href = `/portfolio#${encodeURIComponent(uri)}`;
    }
    onWindowResize() {
        const viewportHeight = WindowUtility.viewport.height;
        const innerHeight = WindowUtility.inner.height;
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
        this.mouseCatcherDom.css({
            left: clientX,
            top: clientY,
            margin: !this.mouseCatcherOverrideScale && `${-magic / 2}px 0px 0px ${-magic / 2}px`,
            height: !this.mouseCatcherOverrideScale && magic,
            width: !this.mouseCatcherOverrideScale && magic,
        });
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
                transform: `translate(${(clientX - WindowUtility.vw(50)) / 10}px, ${(clientY - WindowUtility.vh(50)) / 10}px)`,
            });
        });
    }
    async onClick(event) {
        const { currentTarget, } = event;
        this.currentOnClickDom = $(currentTarget);
        await this.clickFrameAnimator.animate(0, 30);
    }
}
//# sourceMappingURL=tv.js.map