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
import { $, $$, } from '../resources/utilities.js';
export class Sign {
    constructor() {
        this.titles = [];
        this.outlines = [];
        this.descriptions = [];
        this.socials = [];
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            if (document.readyState === 'loading') {
                yield new Promise((resolve) => $(window).on('domcontentloaded', resolve));
            }
            this.createDescriptions();
            this.createWhoAmITitle();
            this.createWhoAmIOutline();
            this.createWhoAmISocial();
            this.createWhatNowTitle();
            this.createWhatNowOutline();
        });
    }
    createWhoAmITitle() {
        const titleDoms = $$('.sign > .whoAmI > .title.container > .title:not(.outline)');
        titleDoms.fastEach((titleDom) => {
            const revealScrollAnimator = new ScrollAnimator();
            const { textContent, } = titleDom;
            this.separateTextContentIntoSpans(titleDom, 'letter');
            const totalFrames = 240;
            titleDom.childNodes.forEach((node, index) => {
                // add reveal animations
                revealScrollAnimator.add({
                    index: 0,
                    type: 'null',
                    items: {
                        totalFrames,
                        offset: (totalFrames - (index
                            * ((totalFrames) / textContent.length))) * 4,
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
                                    * (animationTotalFrames - frame))
                                    - (animationTotalFrames - frame)
                                        * 3}px)`,
                                opacity: Number(frame > 10),
                            });
                        },
                    },
                });
            });
            this.titles.push({
                domContent: titleDom,
                revealScrollAnimator,
            });
        });
    }
    createDescriptions() {
        const descriptionDoms = $$('.sign > * > .description.container > .description');
        descriptionDoms.fastEach((descriptionDom, i) => {
            const revealScrollAnimator = new ScrollAnimator();
            this.separateTextContentIntoSpans(descriptionDom, 'block');
            const totalFrames = 240;
            const textNodes = Array.from(descriptionDom.childNodes)
                .getAll((node) => node.nodeName.toLowerCase() !== 'br');
            textNodes.fastEach((node, index) => {
                // add reveal animations
                revealScrollAnimator.add({
                    index: i,
                    type: 'null',
                    items: {
                        totalFrames,
                        offset: (totalFrames - (index
                            * ((totalFrames) / textNodes.length))) / 4 + 120,
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
                                transform: `translateY(-${(animationTotalFrames - frame)}px)`,
                                opacity: Number(frame > 10),
                            });
                        },
                    },
                });
                revealScrollAnimator.add({
                    index: 0,
                    type: 'null',
                    items: {
                        totalFrames,
                    },
                });
            });
            this.descriptions.push({
                domContent: descriptionDom,
                revealScrollAnimator,
            });
        });
    }
    createWhoAmIOutline() {
        const whoAmIOutlineDom = $('.sign > .whoAmI > .title.container > .outline');
        const revealScrollAnimator = new ScrollAnimator();
        const { textContent, } = whoAmIOutlineDom;
        this.separateTextContentIntoSpans(whoAmIOutlineDom, 'letter');
        const totalFrames = 240;
        whoAmIOutlineDom.childNodes.forEach((node, index) => {
            // add reveal animations
            revealScrollAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    totalFrames,
                },
            });
            revealScrollAnimator.add({
                index: 1,
                type: 'null',
                items: {
                    totalFrames,
                    offset: ((index
                        * ((totalFrames) / textContent.length))) * 8,
                    bezier: [0.5, 0, 0.75, 0],
                    onFrame: (animation, frame) => {
                        const domContent = $(node);
                        domContent.css({
                            transform: `translateX(-${frame * 3}px)`,
                            opacity: Number(frame < 239),
                        });
                    },
                },
            });
        });
        this.outlines.push({
            domContent: whoAmIOutlineDom,
            revealScrollAnimator,
        });
    }
    createWhoAmISocial() {
        const socialDom = $('.sign > .whoAmI > .description.container > .socials.container');
        const revealScrollAnimator = new ScrollAnimator();
        const totalFrames = 240;
        Array.from(socialDom.children).forEach((node, index) => {
            // add reveal animations
            revealScrollAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    totalFrames,
                },
            });
            revealScrollAnimator.add({
                index: 1,
                type: 'null',
                items: {
                    totalFrames,
                    offset: (totalFrames - (index
                        * ((totalFrames) / socialDom.childNodes.length))) * 2,
                    bezier: [0.75, 0, 0.25, 1],
                    onFrame: (animation, frame) => {
                        const domContent = $(node);
                        domContent.css({
                            transform: `translateY(${(index % 2 ? 1 : -1) * (frame / 4)}px)`,
                            opacity: Number(frame < 239),
                        });
                    },
                },
            });
            revealScrollAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    totalFrames,
                },
            });
        });
        this.socials.push({
            domContent: socialDom,
            revealScrollAnimator,
        });
    }
    createWhatNowOutline() {
        const whatNowOutlineDom = $('.sign > .whatNow > .title.container > .outline');
        const revealScrollAnimator = new ScrollAnimator();
        const { textContent, } = whatNowOutlineDom;
        this.separateTextContentIntoSpans(whatNowOutlineDom, 'letter');
        const totalFrames = 240;
        whatNowOutlineDom.childNodes.forEach((node, index) => {
            // add reveal animations
            revealScrollAnimator.add({
                index: 0,
                type: 'null',
                items: {
                    totalFrames,
                },
            });
            revealScrollAnimator.add({
                index: 1,
                type: 'null',
                items: {
                    totalFrames,
                    offset: (totalFrames - (index
                        * ((totalFrames) / textContent.length))) * 8,
                    bezier: [0.75, 0, 0.25, 1],
                    onFrame: (animation, frame) => {
                        const { totalFrames: animationTotalFrames, } = animation.items;
                        const domContent = $(node);
                        domContent.css({
                            transform: `translateY(-${(animationTotalFrames - frame)}px)`,
                            opacity: Number(frame > 60),
                        });
                    },
                },
            });
        });
        this.outlines.push({
            domContent: whatNowOutlineDom,
            revealScrollAnimator,
        });
    }
    createWhatNowTitle() {
        const titleDoms = $$('.sign > .whatNow > .title.container > .title:not(.outline)');
        titleDoms.fastEach((titleDom) => {
            const revealScrollAnimator = new ScrollAnimator();
            const { textContent, } = titleDom;
            this.separateTextContentIntoSpans(titleDom, 'letter');
            const totalFrames = 240;
            titleDom.childNodes.forEach((node, index) => {
                // add reveal animations
                revealScrollAnimator.add({
                    index: 0,
                    type: 'null',
                    items: {
                        totalFrames,
                    },
                });
                revealScrollAnimator.add({
                    index: 1,
                    type: 'null',
                    items: {
                        totalFrames,
                        offset: (totalFrames - (index
                            * ((totalFrames) / textContent.length))) * 4,
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
                                transform: `translate(${((index % 2 ? 1 : -1)
                                    * (animationTotalFrames - frame))
                                    - (animationTotalFrames - frame)}px, ${((index % 2 ? -1 : 1)
                                    * (animationTotalFrames - frame))
                                    - (animationTotalFrames - frame)}px)`,
                                opacity: Number(frame > 10),
                            });
                        },
                    },
                });
            });
            this.titles.push({
                domContent: titleDom,
                revealScrollAnimator,
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