var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { lottie } from '../raw/libraries/lottie.js';
import { $, WindowUtility, $$, } from '../resources/utilities.js';
import { FrameAnimator } from '../resources/animators.js';
export class Hamburger {
    constructor(mCoreAnimator) {
        this.mWindowUtility = new WindowUtility();
        this.lottieAnimation = null;
        this.lottiePlayDirection = -1;
        this.hamburgerIconDom = $('.header.containersWrapper > .hamburger');
        this.hamburgerMenuContainersWrapperDom = $('.__hamburgerMenu.containersWrapper');
        this.skinDom = $('.skin');
        this.organsDom = $('.organs');
        this.titles = [];
        this.clickFrameAnimator = new FrameAnimator();
        this.currentOnClickDom = null;
        this.currentOnMouseDom = null;
        this.cachedAnimationsLength = null;
        this.ctx = mCoreAnimator;
        $(window).on('resize', () => window.requestAnimationFrame(() => this.onWindowResize.call(this)));
    }
    create(lottieAnimationData) {
        return __awaiter(this, void 0, void 0, function* () {
            this.lottieAnimationData = lottieAnimationData;
            this.clickFrameAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    totalFrames: 30,
                    onFrame: (animation, frame) => {
                        const domContent = this.currentOnClickDom;
                        domContent.css({
                            opacity: Math.ceil((animation.items.totalFrames - frame) / 3) % 4 ? 0 : 1,
                        });
                    },
                },
            });
            this.hamburgerIconDom.on('click', (event) => {
                this.hamburgerMenuContainersWrapperDom.removeClass('hidden');
                this.onClick.call(this, event);
            });
            this.hamburgerMenuContainersWrapperDom.addClass('hidden');
            const otherOnAdd = this.ctx.onAdd;
            this.ctx.onAdd = (animation) => {
                otherOnAdd.call(this.ctx, animation);
                this.createHamburgerMenuItems();
            };
            this.createHamburgerMenuItems();
            this.createHamburgerToppings();
            this.addLottie();
        });
    }
    createHamburgerToppings() {
        $('.header.containersWrapper > .logo').on('click', (event) => {
            this.ctx.seekTo(0);
            if (!this.isOpen) {
                this.currentOnClickDom = $(event.currentTarget);
                this.clickFrameAnimator.animate(0, 30);
                return;
            }
            this.onClick(event);
        });
    }
    addLottie() {
        this.lottieAnimation = lottie.loadAnimation({
            container: this.hamburgerIconDom,
            renderer: 'canvas',
            autoplay: false,
            animationData: this.lottieAnimationData,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMin meet',
                className: 'hamburger',
            },
        });
    }
    get isOpen() {
        return this.lottiePlayDirection === 1;
    }
    getLottieData() {
        return __awaiter(this, void 0, void 0, function* () {
            return $().getJSON('/assets/js/raw/lottie/hamburger.json');
        });
    }
    onClick(event, options) {
        if (!options) {
            this.onClick(event, {});
            return;
        }
        const { newState, } = options;
        if ((newState === 'closed'
            && !this.isOpen) || (newState === 'opened'
            && this.isOpen)) {
            return;
        }
        const titles = $$(`.${Hamburger.PREFIX}.title`);
        if (this.isOpen) {
            this.animateCloseHamburger();
            titles.fastEach((hamburgerMenuTitleDom) => this.animateTitleReveal(hamburgerMenuTitleDom, 'hide'));
        }
        else {
            if (this.currentOnMouseDom) {
                this.animateTitleHover(this.currentOnMouseDom, 'out');
            }
            this.animateOpenHamburger();
            titles.fastEach((hamburgerMenuTitleDom) => this.animateTitleReveal(hamburgerMenuTitleDom, 'reveal'));
        }
        this.lottiePlayDirection *= -1;
        this.lottieAnimation.setDirection(this.lottiePlayDirection);
        this.lottieAnimation.play();
        this.currentOnClickDom = $(event.currentTarget);
        this.clickFrameAnimator.animate(0, 30);
    }
    onTitleMouseOver(event) {
        this.currentOnMouseDom = $(event.currentTarget);
        this.currentOnMouseChildDom = $(event.target);
        this.animateTitleHover($(event.currentTarget), 'over');
    }
    onTitleMouseOut(event) {
        this.currentOnMouseDom = $(event.currentTarget);
        this.currentOnMouseChildDom = $(event.target);
        this.animateTitleHover($(event.currentTarget), 'out');
    }
    animateOpenHamburger() {
        const windowHeight = Math.min(this.mWindowUtility.viewport.height, this.mWindowUtility.inner.height);
        const windowWidth = Math.min(this.mWindowUtility.viewport.width, this.mWindowUtility.inner.width);
        const height = 1;
        const width = 0;
        const top = (windowHeight - height) / 2;
        const left = (windowWidth - width) / 2;
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
    animateCloseHamburger() {
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
    }
    createHamburgerMenuItems() {
        if (this.cachedAnimationsLength === this.ctx.animations.length) {
            return;
        }
        // used to get value of variable instead of reference
        this.cachedAnimationsLength = Number(this.ctx.animations.length);
        // clear the insides to prevent duplicates
        this.hamburgerMenuContainersWrapperDom.innerHTML = '';
        // programatically generate css grid
        this.hamburgerMenuContainersWrapperDom.css({
            // add 1 if there's a pre animation (index of -1)
            'grid-template-rows': `auto repeat(${this.ctx.animations.length + Number(!!this.ctx.animations[-1])}, min-content) auto`,
        });
        // append dom nodes and create animator instances for each first animation
        const handler = (workingAnimations, i) => {
            const { uid, } = workingAnimations[0].items;
            const menuContainerDom = $(document.createElement('div'));
            menuContainerDom.addClass([
                Hamburger.PREFIX,
                'container',
                uid,
            ]);
            const titleDom = $(document.createElement('h1'));
            titleDom.addClass([
                Hamburger.PREFIX,
                'title',
                uid,
            ]);
            // titleDom.textContent = uid;
            this.hamburgerMenuContainersWrapperDom.appendChild(menuContainerDom);
            menuContainerDom.appendChild(titleDom);
            let processedIndex = i;
            if (this.ctx.animations[-1]) {
                processedIndex += 1;
            }
            menuContainerDom.css({
                'grid-row': `${processedIndex + 2} / ${processedIndex + 3}`,
                'grid-column': '2 / 3',
            });
            const revealFrameAnimator = new FrameAnimator();
            const hoverFrameAnimator = new FrameAnimator();
            this.titles.push({
                domContent: titleDom,
                revealFrameAnimator,
                hoverFrameAnimator,
            });
            const prefix = '——';
            const suffix = '';
            const textContent = uid;
            const classList = titleDom.classList.value;
            titleDom.textContent = '';
            // prefix
            const prefixSpanDom = document.createElement('span');
            prefixSpanDom.className = classList.replace('title', 'prefix');
            prefixSpanDom.textContent = `${prefix}\xa0`; // prefix + &nbsp;
            titleDom.appendChild(prefixSpanDom);
            // content
            textContent
                .split('')
                .fastEach((titleChar) => {
                const spanDom = document.createElement('span');
                spanDom.className = `${classList.replace('title', 'char')} hoverLine`;
                spanDom.textContent = titleChar;
                titleDom.appendChild(spanDom);
            });
            // suffix
            const suffixSpanDom = document.createElement('span');
            suffixSpanDom.className = classList.replace('title', 'suffix');
            suffixSpanDom.textContent = suffix; // prefix + &nbsp;
            titleDom.appendChild(suffixSpanDom);
            const totalFrames = 120;
            titleDom.childNodes.forEach((node, index) => {
                // add reveal animations
                revealFrameAnimator.add({
                    index: 0,
                    type: 'null',
                    items: {
                        totalFrames,
                        offset: (index
                            * ((totalFrames) / titleDom.textContent.length)),
                        bezier: [0.165, 0.84, 0.44, 1],
                        onHidden: () => {
                            const domContent = $(node);
                            domContent.css({
                                opacity: 0,
                            });
                        },
                        onFrame: (animation, frame) => {
                            const { totalFrames: animationTotalFrames, } = animation.items;
                            const domContent = $(node);
                            domContent.css({
                                transform: `translateX(${(animationTotalFrames - frame) / 2}px)`,
                                opacity: 1,
                            });
                        },
                    },
                });
                // add pre to enable onHidden
                revealFrameAnimator.add({
                    index: -1,
                    type: 'null',
                });
                // if the currently working item is not the prefix
                if (!node.classList.contains('prefix')) {
                    // add hover animations
                    hoverFrameAnimator.add({
                        index: 0,
                        type: 'null',
                        items: {
                            totalFrames,
                            offset: index
                                * ((totalFrames) / titleDom.textContent.length),
                            bezier: [0.77, 0, 0.175, 1],
                            onHidden: () => {
                                const domContent = $(node);
                                domContent.css({
                                    transform: 'translateY(0px)',
                                });
                            },
                            onFrame: (animation, frame) => {
                                const domContent = $(node);
                                const { totalFrames: animationTotalFrames, } = animation.items;
                                switch (true) {
                                    // if currently not hovering over prefix, remove 'forced'
                                    case !this.currentOnMouseChildDom.classList.contains('prefix'):
                                        domContent.removeClass('forced');
                                        break;
                                    case frame <= animationTotalFrames / 2:
                                        domContent.removeClass('forced');
                                        break;
                                    case frame > animationTotalFrames / 2:
                                        // if currently hovering on prefix, add 'forced'
                                        if (!this.currentOnMouseChildDom.classList.contains('prefix')) {
                                            break;
                                        }
                                        domContent.addClass('forced');
                                        break;
                                    default:
                                }
                                domContent.css({
                                    transform: `translateY(${index % 2 === 0 ? '' : '-'}${frame / 14}px)`,
                                });
                            },
                        },
                    });
                    // add pre to enable onHidden
                    hoverFrameAnimator.add({
                        index: -1,
                        type: 'null',
                    });
                }
            });
            titleDom.on('click', (event) => {
                this.ctx.seekToUid(uid);
                this.onClick(event, {
                    newState: 'closed',
                });
            });
            titleDom.on('mouseover', (event) => {
                this.onTitleMouseOver(event);
            });
            titleDom.on('mouseout mouseleave', (event) => {
                this.onTitleMouseOut(event);
            });
        };
        if (this.ctx.animations[-1]) {
            handler(this.ctx.animations[-1], -1);
        }
        this.ctx.animations.fastEach(handler);
    }
    animateTitleHover(titleDom, state) {
        let titleIndex = this.titles.length;
        let totalFrames = null;
        // get working title
        this.titles.forEach((title, index) => {
            if (title.domContent === titleDom) {
                titleIndex = index;
                totalFrames = title.hoverFrameAnimator.animations[0][0].items.totalFrames;
            }
        });
        let end = null;
        switch (state) {
            case 'over':
                end = totalFrames;
                break;
            case 'out':
                end = 0;
                break;
            default:
                return;
        }
        const { hoverFrameAnimator } = this.titles[titleIndex];
        if (hoverFrameAnimator.currentFrame === end
            && end === 0) {
            hoverFrameAnimator.animate(end, end + 1);
            return;
        }
        hoverFrameAnimator.animate(hoverFrameAnimator.currentFrame, end);
    }
    animateTitleReveal(titleDom, state) {
        let titleIndex = this.titles.length;
        let totalFrames = null;
        // get working title
        this.titles.forEach((title, index) => {
            if (title.domContent === titleDom) {
                titleIndex = index;
                totalFrames = title.revealFrameAnimator.animations[0][0].items.totalFrames;
            }
        });
        let end = null;
        let speed = null;
        switch (state) {
            case 'reveal':
                end = totalFrames;
                speed = 1;
                break;
            case 'hide':
                end = 0;
                speed = 2;
                break;
            default:
                return;
        }
        const { revealFrameAnimator } = this.titles[titleIndex];
        if (revealFrameAnimator.currentFrame === end) {
            revealFrameAnimator.animate(end, end + 1);
            return;
        }
        revealFrameAnimator.animate(revealFrameAnimator.currentFrame, end, {
            speed,
        });
    }
    onWindowResize() {
        if (this.isOpen) {
            this.animateOpenHamburger();
            return;
        }
        this.animateCloseHamburger();
    }
}
Hamburger.PREFIX = '__hamburgerMenu';
//# sourceMappingURL=hamburger.js.map