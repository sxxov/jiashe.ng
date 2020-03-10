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
import { $, WindowUtility, $$, } from '../resources/utilities.js';
import { FrameAnimator } from '../resources/animators.js';
export class Hamburger {
    constructor(mCoreAnimator) {
        this.lottieAnim = null;
        this.playDirection = -1;
        this.containerDom = $('.hamburgerContainer');
        this.menuContainersWrapperDom = $('.__hamburgerMenu.containersWrapper');
        this.hamburgerMenuClassPrefix = '__hamburgerMenu';
        this.organsDom = $('.organs');
        this.skinDom = $('.skin');
        this.mWindowUtility = new WindowUtility();
        this.titles = [];
        this.haveItemsBeenCreated = false;
        this.mCoreAnimator = mCoreAnimator;
        $(window).on('resize', () => window.requestAnimationFrame(() => this.onWindowResize.call(this)));
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.data = data;
            this.containerDom.on('click', () => {
                this.onClick.call(this);
            });
            this.addLottie();
            this.animate();
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
    get isOpen() {
        return this.playDirection === -1;
    }
    getLottieData() {
        return __awaiter(this, void 0, void 0, function* () {
            return $().getJSON('/assets/js/raw/lottie/hamburger.json');
        });
    }
    onClick() {
        this.playDirection *= -1;
        this.lottieAnim.setDirection(this.playDirection);
        this.lottieAnim.play();
        this.createHamburgerMenuItems();
        this.animate();
        $$(`.${this.hamburgerMenuClassPrefix}.title`)
            .fastEach((hamburgerMenuTitleDom) => this.animateTextReveal(hamburgerMenuTitleDom));
    }
    onTitleMouseOver(event) {
        this.animateTitleHover($(event.currentTarget), 'over');
    }
    onTitleMouseOut(event) {
        this.animateTitleHover($(event.currentTarget), 'out');
    }
    onTitleClick(event) {
        this.animateTitleClick($(event.currentTarget));
    }
    animate() {
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
    createHamburgerMenuItems() {
        if (this.haveItemsBeenCreated) {
            return;
        }
        this.menuContainersWrapperDom.css({
            'grid-template-rows': `auto repeat(${this.mCoreAnimator.animations.length}, min-content) auto`,
        });
        this.mCoreAnimator.animations.fastEach((workingAnimations, i) => {
            const { uid, } = workingAnimations[0].items;
            const menuContainerDom = $(document.createElement('div'));
            menuContainerDom.addClass([this.hamburgerMenuClassPrefix, 'container', uid]);
            const titleDom = $(document.createElement('h1'));
            titleDom.addClass([this.hamburgerMenuClassPrefix, 'title', uid]);
            titleDom.textContent = uid;
            this.menuContainersWrapperDom.appendChild(menuContainerDom);
            menuContainerDom.appendChild(titleDom);
            menuContainerDom.css({
                'grid-row': `${i + 2} / ${i + 3}`,
                'grid-column': '2 / 3',
            });
            const revealFrameAnimator = new FrameAnimator();
            const hoverFrameAnimator = new FrameAnimator();
            const clickFrameAnimator = new FrameAnimator();
            this.titles.push({
                domContent: titleDom,
                revealFrameAnimator,
                hoverFrameAnimator,
                clickFrameAnimator,
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
                        onVisible: () => {
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
                                opacity: 1,
                            });
                        },
                    },
                });
                hoverFrameAnimator.add({
                    index: -1,
                    type: 'null',
                });
            });
            // add click animations
            clickFrameAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    totalFrames,
                    bezier: [0.075, 0.82, 0.165, 1],
                    onFrame: (animation, frame) => {
                        const domContent = titleDom;
                        domContent.css({
                            opacity: Math.ceil((animation.items.totalFrames - frame) / 8) % 4 ? 0 : 1,
                        });
                    },
                },
            });
            titleDom.on('click', (event) => {
                this.onTitleClick(event);
                this.mCoreAnimator.seekToUid(uid);
                this.onClick();
            });
            titleDom.on('mouseover', (event) => {
                this.onTitleMouseOver(event);
            });
            titleDom.on('mouseout mouseleave', (event) => {
                this.onTitleMouseOut(event);
            });
        });
        this.haveItemsBeenCreated = true;
    }
    animateTitleClick(titleDom) {
        let titleIndex = this.titles.length;
        let totalFrames = null;
        this.titles.forEach((title, index) => {
            if (title.domContent === titleDom) {
                titleIndex = index;
                totalFrames = title.hoverFrameAnimator.animations[0][0].items.totalFrames;
            }
        });
        this.titles[titleIndex].clickFrameAnimator.animate(0, totalFrames);
    }
    animateTitleHover(titleDom, state) {
        let titleIndex = this.titles.length;
        let totalFrames = null;
        this.titles.forEach((title, index) => {
            if (title.domContent === titleDom) {
                titleIndex = index;
                totalFrames = title.hoverFrameAnimator.animations[0][0].items.totalFrames;
            }
        });
        let start = null;
        let end = null;
        switch (state) {
            case 'over':
                start = 0;
                end = totalFrames;
                break;
            case 'out':
                start = totalFrames;
                end = 0;
                break;
            default:
                return;
        }
        const { hoverFrameAnimator } = this.titles[titleIndex];
        hoverFrameAnimator.animate(hoverFrameAnimator.currentFrame, hoverFrameAnimator.currentFrame === end
            ? start
            : end);
    }
    animateTextReveal(titleDom) {
        let titleIndex = this.titles.length;
        let totalFrames = null;
        this.titles.forEach((title, index) => {
            if (title.domContent === titleDom) {
                titleIndex = index;
                totalFrames = title.revealFrameAnimator.animations[0][0].items.totalFrames;
            }
        });
        if (this.isOpen) {
            return;
        }
        this.titles[titleIndex].revealFrameAnimator.animate(0, totalFrames);
    }
    onWindowResize() {
        this.animate();
    }
}
//# sourceMappingURL=hamburger.js.map