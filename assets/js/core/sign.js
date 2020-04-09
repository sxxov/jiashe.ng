var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ScrollAnimator } from '../resources/animators.js';
import { $, $$, WindowUtility, } from '../resources/utilities.js';
export class Sign {
    constructor() {
        this.mWindowUtility = new WindowUtility();
        this.placeholders = {
            pixels: () => Math.floor(document.body.clientHeight
                - this.mWindowUtility.viewport.height
                - window.scrollY),
        };
        this.descriptionDomCache = [];
        this.totalFrames = 240;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            if (document.readyState === 'loading') {
                yield new Promise((resolve) => $(window).on('domcontentloaded', resolve));
            }
            this.createAnimations();
            this.createPlaceholderReplacers();
        });
    }
    createPlaceholderReplacers() {
        this.cacheDescriptionPlaceholders();
        this.updateDescriptionPlaceholders();
        $(window).on('scroll', () => this.updateDescriptionPlaceholders.call(this));
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
    cacheDescriptionPlaceholders() {
        const descriptionDoms = $$('.sign > * > .description.container > .description');
        descriptionDoms.fastEach((descriptionDom) => {
            descriptionDom
                .childNodes
                .forEach((node) => {
                const { textContent, } = node;
                if (textContent === '') {
                    return;
                }
                // +2 is to shift over '{{' & '}}' itself
                const indexOfKeyword = textContent.indexOf('{{') + 2;
                const indexOfRest = textContent.indexOf('}}') + 2;
                // compare to 1 instead of -1 because of the +2 offset
                if (indexOfKeyword === 1
                    || indexOfRest === 1) {
                    return;
                }
                this.descriptionDomCache.push({
                    domContent: $(node),
                    textContent,
                });
            });
        });
    }
    updateDescriptionPlaceholders() {
        this.descriptionDomCache.fastEach((descriptionDomCache) => {
            const { domContent, textContent, } = descriptionDomCache;
            // +2 is to shift over '{{' & '}}' itself
            const indexOfKeyword = textContent.indexOf('{{') + 2;
            const indexOfRest = textContent.indexOf('}}') + 2;
            if (indexOfKeyword === -1) {
                return;
            }
            // substr is faster https://www.measurethat.net/Benchmarks/Show/2335/1/slice-vs-substr-vs-substring-with-no-end-index
            const keyword = textContent
                .substr(indexOfKeyword, indexOfRest - 2 - indexOfKeyword);
            let result = null;
            Object.keys(this.placeholders)
                .fastEach((key) => {
                if (key !== keyword) {
                    return;
                }
                const value = this.placeholders[key];
                if (value
                    && value.constructor === Function) {
                    result = value();
                    return;
                }
                result = value;
            });
            domContent.textContent = `${textContent.substr(0, indexOfKeyword - 2)}${result}${textContent.substr(indexOfRest)}`;
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