import { ScrollAnimator } from '../resources/animators';
import { $, $$, WindowUtility, } from '../resources/utilities';
import { Placeholderer } from './placeholderer';
export class Sign {
    constructor() {
        this.mPlaceholderer = new Placeholderer();
        this.mWindowUtility = new WindowUtility();
        this.totalFrames = 240;
    }
    async create() {
        if (document.readyState === 'loading') {
            await new Promise((resolve) => $(window).on('domcontentloaded', resolve));
        }
        this.createAnimations();
        this.mPlaceholderer.placeholders = {
            pixels: () => Math.floor(document.body.clientHeight
                - WindowUtility.viewport.height
                - window.scrollY),
        };
        this.mPlaceholderer.create();
        $(window).on('scroll', () => this.mPlaceholderer.updateDescriptionPlaceholders());
    }
    createAnimations() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        this.createDescriptions();
        this.createWhoAmITitle();
        this.createWhoAmIOutline();
        this.createWhoAmISocial();
        this.createWhatNowTitle();
        this.createWhatNowOutline();
    }
    createWhoAmITitle() {
        const titleDoms = $$('.sign > .whoAmI > .title.container > .title:not(.outline)');
        const charRevealScrollAnimator = new ScrollAnimator();
        const { totalFrames } = this;
        charRevealScrollAnimator.add({
            index: -1,
            type: 'null',
            items: {
                totalFrames,
            },
        });
        titleDoms.fastEach((titleDom) => {
            this.separateTextContentIntoSpans(titleDom, 'letter');
            titleDom.childNodes.forEach((node, index) => {
                // add reveal animations
                charRevealScrollAnimator.add({
                    index: 0,
                    type: 'null',
                    items: {
                        totalFrames,
                        offset: -((totalFrames
                            * (1 - (index) / (titleDom.childNodes.length - 1)))) / 4,
                        bezier: [0.75, 0, 0.25, 1],
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
                                transform: `translateY(${((index % 2 ? 1 : -1)
                                    * (animationTotalFrames - frame)
                                    * 4)
                                    / window.devicePixelRatio}px)`,
                                opacity: Number(frame > 10),
                            });
                        },
                    },
                });
            });
        });
    }
    createDescriptions() {
        const descriptionDoms = $$('.sign > * > .description.container > .description');
        const charRevealScrollAnimator = new ScrollAnimator();
        const { totalFrames } = this;
        charRevealScrollAnimator.add({
            index: -1,
            type: 'null',
            items: {
                totalFrames,
            },
        });
        descriptionDoms.fastEach((descriptionDom, i) => {
            this.separateTextContentIntoSpans(descriptionDom, 'block');
            const textNodes = Array.from(descriptionDom.childNodes)
                .getAll((node) => node.nodeName.toLowerCase() !== 'br');
            textNodes.fastEach((node, index) => {
                // add reveal animations
                charRevealScrollAnimator.add({
                    index: i,
                    type: 'null',
                    items: {
                        totalFrames,
                        offset: -((totalFrames
                            * (1 - (index) / (textNodes.length - 1)))) / 4,
                        bezier: [0.75, 0, 0.25, 1],
                        onFrame: (animation, frame) => {
                            const { totalFrames: animationTotalFrames, } = animation.items;
                            const domContent = $(node);
                            domContent.css({
                                transform: `translateY(-${(animationTotalFrames - frame)}px)`,
                            });
                        },
                    },
                });
            });
        });
    }
    createWhoAmIOutline() {
        const whoAmIOutlineDom = $('.sign > .whoAmI > .title.container > .outline');
        const revealScrollAnimator = new ScrollAnimator();
        this.separateTextContentIntoSpans(whoAmIOutlineDom, 'letter');
        const { totalFrames } = this;
        revealScrollAnimator.add({
            index: 0,
            type: 'null',
            items: {
                totalFrames,
            },
        });
        whoAmIOutlineDom.childNodes.forEach((node, index) => {
            // add reveal animations
            revealScrollAnimator.add({
                index: 1,
                type: 'null',
                items: {
                    totalFrames,
                    offset: -((totalFrames
                        * ((index) / (whoAmIOutlineDom.childNodes.length - 1)))) / 2,
                    bezier: [0.75, 0, 0.25, 1],
                    onFrame: (animation, frame) => {
                        const domContent = $(node);
                        domContent.css({
                            transform: `translateX(-${frame * 2}px)`,
                            opacity: Number(frame < 239),
                        });
                    },
                },
            });
        });
    }
    createWhoAmISocial() {
        const socialDom = $('.sign > .whoAmI > .description.container > .socials.container');
        const iconRevealAnimator = new ScrollAnimator();
        const { totalFrames } = this;
        iconRevealAnimator.add({
            index: 0,
            type: 'null',
            items: {
                totalFrames,
            },
        });
        Array.from(socialDom.children).fastEach((node, index) => {
            // add reveal animations
            iconRevealAnimator.add({
                index: 1,
                type: 'null',
                items: {
                    totalFrames,
                    offset: -((totalFrames
                        * (1 - (index) / (socialDom.children.length)))) + 60,
                    bezier: [0.75, 0, 0.25, 1],
                    onHidden: () => {
                        const domContent = $(node);
                        domContent.css({
                            transform: 'translateY(0px)',
                        });
                    },
                    onFrame: (animation, frame) => {
                        const domContent = $(node);
                        domContent.css({
                            transform: `translateY(${(index % 2 ? 1 : -1) * (frame / 4)}px)`,
                            opacity: Number(frame < 180),
                        });
                    },
                },
            });
        });
    }
    createWhatNowOutline() {
        const whatNowOutlineDom = $('.sign > .whatNow > .title.container > .outline');
        const revealScrollAnimator = new ScrollAnimator();
        this.separateTextContentIntoSpans(whatNowOutlineDom, 'letter');
        const { totalFrames } = this;
        whatNowOutlineDom.childNodes.forEach((node, index) => {
            // add reveal animations
            revealScrollAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    onVisible: () => {
                        const domContent = $(node);
                        domContent.css({
                            opacity: 0,
                        });
                    },
                    totalFrames,
                },
            });
            const offset = -((totalFrames
                * (1 - (index) / (whatNowOutlineDom.childNodes.length - 1)))) / 2;
            revealScrollAnimator.add({
                index: 1,
                type: 'null',
                items: {
                    totalFrames,
                    offset,
                    bezier: [0.75, 0, 0.25, 1],
                    onFrame: (animation, frame) => {
                        const { totalFrames: animationTotalFrames, } = animation.items;
                        const domContent = $(node);
                        domContent.css({
                            transform: `translateY(-${(animationTotalFrames - frame)
                                * 2}px)`,
                            opacity: Number(frame > 60 - offset),
                        });
                    },
                },
            });
        });
    }
    createWhatNowTitle() {
        const titleDoms = $$('.sign > .whatNow > .title.container > .title:not(.outline)');
        titleDoms.fastEach((titleDom) => {
            const charRevealScrollAnimator = new ScrollAnimator();
            this.separateTextContentIntoSpans(titleDom, 'letter');
            const { totalFrames } = this;
            charRevealScrollAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    totalFrames,
                },
            });
            titleDom.childNodes.forEach((node, index) => {
                // add reveal animations
                charRevealScrollAnimator.add({
                    index: 1,
                    type: 'null',
                    items: {
                        totalFrames,
                        offset: -((totalFrames
                            * (1 - (index) / (titleDom.childNodes.length - 1)))) / 2,
                        bezier: [0.75, 0, 0.25, 1],
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
                                transform: `translate${index % 2 ? 'Y' : 'X'}(-${((animationTotalFrames - frame)
                                    * 2)
                                    / window.devicePixelRatio}px)`,
                                opacity: Number(frame > 10),
                            });
                        },
                    },
                });
            });
        });
    }
    separateTextContentIntoSpans(domContent, mode) {
        const { textContent, className, } = domContent;
        domContent.textContent = '';
        let processedTextContent = null;
        switch (mode) {
            case 'letter': {
                processedTextContent = textContent
                    .trim() // remove whitespace & newlines, at the end of string
                    .replace(/[\t\v ]/g, '') // remove only whitespace, wthin string
                    .replace(/\n\n/g, '\n') // combine double newlines
                    .split('');
                break;
            }
            case 'block': {
                processedTextContent = textContent
                    .trim() // remove whitespace & newlines, at the end of string
                    .replace(/\n/g, '__split__\n') // add split point
                    .split('__split__');
                break;
            }
            default:
                return;
        }
        // split into spans
        processedTextContent.fastEach((titleChar) => {
            if (titleChar.replace(/[\t\v ]/g, '') === '\n') {
                const brDom = document.createElement('br');
                domContent.appendChild(brDom);
                return;
            }
            const spanDom = document.createElement('span');
            spanDom.className = `${className} char`;
            spanDom.textContent = titleChar;
            domContent.appendChild(spanDom);
        });
    }
}
Sign.PREFIX = '__sign';
//# sourceMappingURL=sign.js.map