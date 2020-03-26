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
        this.lottieAnim = null;
        this.playDirection = -1;
        this.headerHamburgerIconDom = $('.header.containersWrapper > .hamburger');
        this.menuContainersWrapperDom = $('.__hamburgerMenu.containersWrapper');
        this.skinDom = $('.skin');
        this.organsDom = $('.organs');
        this.titles = [];
        this.clickFrameAnimator = new FrameAnimator();
        this.currentOnClickDom = null;
        this.cachedAnimationsLength = null;
        this.currentOnMouseDom = null;
        this.ctx = mCoreAnimator;
        $(window).on('resize', () => window.requestAnimationFrame(() => this.onWindowResize.call(this)));
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.data = data;
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
            this.headerHamburgerIconDom.on('click', (event) => {
                this.menuContainersWrapperDom.removeClass('hidden');
                this.onClick.call(this, event);
            });
            this.menuContainersWrapperDom.addClass('hidden');
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
        this.lottieAnim = lottie.loadAnimation({
            container: this.headerHamburgerIconDom,
            renderer: 'canvas',
            autoplay: false,
            animationData: this.data,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMin meet',
                className: 'hamburger',
            },
        });
    }
    get isOpen() {
        return this.playDirection === 1;
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
        this.playDirection *= -1;
        this.lottieAnim.setDirection(this.playDirection);
        this.lottieAnim.play();
        this.currentOnClickDom = $(event.currentTarget);
        this.clickFrameAnimator.animate(0, 30);
    }
    onTitleMouseOver(event) {
        this.currentOnMouseDom = $(event.currentTarget);
        this.animateTitleHover($(event.currentTarget), 'over');
    }
    onTitleMouseOut(event) {
        this.currentOnMouseDom = $(event.currentTarget);
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
        this.menuContainersWrapperDom.innerHTML = '';
        // programatically generate css grid
        this.menuContainersWrapperDom.css({
            'grid-template-rows': `auto repeat(${this.ctx.animations.length}, min-content) auto`,
        });
        // append dom nodes and create animator instances for each first animation
        this.ctx.animations.fastEach((workingAnimations, i) => {
            const { uid, } = workingAnimations[0].items;
            const menuContainerDom = $(document.createElement('div'));
            menuContainerDom.addClass([Hamburger.PREFIX, 'container', uid]);
            const titleDom = $(document.createElement('h1'));
            titleDom.addClass([Hamburger.PREFIX, 'title', uid]);
            titleDom.textContent = uid;
            this.menuContainersWrapperDom.appendChild(menuContainerDom);
            menuContainerDom.appendChild(titleDom);
            menuContainerDom.css({
                'grid-row': `${i + 2} / ${i + 3}`,
                'grid-column': '2 / 3',
            });
            const revealFrameAnimator = new FrameAnimator();
            const hoverFrameAnimator = new FrameAnimator();
            this.titles.push({
                domContent: titleDom,
                revealFrameAnimator,
                hoverFrameAnimator,
            });
            const prefix = '.';
            const suffix = '';
            titleDom.innerHTML = titleDom
                .textContent
                .split('')
                .map((char) => `<span class="${titleDom.classList.value.replace('title', 'char')}">${char}</span>`)
                .join('');
            titleDom.innerHTML = `
				<span class="${titleDom.classList.value.replace('title', 'prefix')}">
					${prefix}
				</span>
				${titleDom.innerHTML}
				<span class="${titleDom.classList.value.replace('title', 'suffix')}">
					${suffix}
				</span>
			`.replace(/[\t\n\r]/g, '');
            const totalFrames = 120;
            titleDom.childNodes.forEach((node, index) => {
                // add reveal animations
                revealFrameAnimator.add({
                    index: 0,
                    type: 'null',
                    items: {
                        totalFrames: totalFrames + 60,
                        offset: (index
                            * ((totalFrames + 60) / titleDom.textContent.length)),
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
                revealFrameAnimator.add({
                    index: -1,
                    type: 'null',
                });
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
                            if (/prefix/gi.test(node.classList.value)) {
                                return;
                            }
                            domContent.css({
                                transform: `translateY(${index % 2 === 0 ? '' : '-'}${frame / 14}px)`,
                            });
                        },
                    },
                });
                hoverFrameAnimator.add({
                    index: -1,
                    type: 'null',
                });
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
        });
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
        if (hoverFrameAnimator.currentFrame === end) {
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