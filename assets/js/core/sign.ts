import { $Object } from '../resources/utilities.types.js';
import { ScrollAnimator } from '../resources/animators.js';
import {
	$,
	$$,
} from '../resources/utilities.js';

export class Sign {
	public static PREFIX = '__sign';

	private titles: [{
		domContent: $Object;
		revealScrollAnimator: ScrollAnimator;
	}?] = [];

	private outlines: [{
		domContent: $Object;
		revealScrollAnimator: ScrollAnimator;
	}?] = [];

	private descriptions: [{
		domContent: $Object;
		revealScrollAnimator: ScrollAnimator;
	}?] = [];

	private socials: [{
		domContent: $Object;
		revealScrollAnimator: ScrollAnimator;
	}?] = [];

	public async create(): Promise<void> {
		if (document.readyState === 'loading') {
			await new Promise((resolve) => $(window).on('domcontentloaded', resolve));
		}

		this.createDescriptions();
		this.createWhoAmITitle();
		this.createWhoAmIOutline();
		this.createWhoAmISocial();
		this.createWhatNowTitle();
		this.createWhatNowOutline();
	}

	private createWhoAmITitle(): void {
		const titleDoms = $$('.sign > .whoAmI > .title.container > .title:not(.outline)');

		titleDoms.fastEach((titleDom: $Object) => {
			const revealScrollAnimator = new ScrollAnimator();
			const {
				textContent,
			} = titleDom;

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
							* ((totalFrames) / textContent.length)
						)) * 4,
						bezier: [0.75, 0, 0.25, 1],
						onHidden: (): void => {
							const domContent = $(node);

							domContent.css({
								opacity: 0,
							});
						},
						onFrame: (animation, frame): void => {
							const {
								totalFrames: animationTotalFrames,
							} = animation.items;

							const domContent = $(node);

							domContent.css({
								transform: `translateY(${
									((index % 2 ? 1 : -1)
										* (animationTotalFrames - frame))
									- (animationTotalFrames - frame)
									* 3
								}px)`,
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

	private createDescriptions(): void {
		const descriptionDoms = $$('.sign > * > .description.container > .description');

		descriptionDoms.fastEach((descriptionDom: $Object, i) => {
			const revealScrollAnimator = new ScrollAnimator();

			this.separateTextContentIntoSpans(descriptionDom, 'block');

			const totalFrames = 240;

			const textNodes = Array.from(descriptionDom.childNodes)
				.getAll((node: Node) => node.nodeName.toLowerCase() !== 'br');

			textNodes.fastEach((node: Node, index: number) => {
				// add reveal animations
				revealScrollAnimator.add({
					index: i,
					type: 'null',
					items: {
						totalFrames,
						offset: (totalFrames - (index
							* ((totalFrames) / textNodes.length)
						)) / 4 + 120,
						bezier: [0.75, 0, 0.25, 1],
						onHidden: (): void => {
							const domContent = $(node);

							domContent.css({
								opacity: 0,
							});
						},
						onFrame: (animation, frame): void => {
							const {
								totalFrames: animationTotalFrames,
							} = animation.items;

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

	private createWhoAmIOutline(): void {
		const whoAmIOutlineDom = $('.sign > .whoAmI > .title.container > .outline');

		const revealScrollAnimator = new ScrollAnimator();
		const {
			textContent,
		} = whoAmIOutlineDom;

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
						* ((totalFrames) / textContent.length)
					)) * 8,
					bezier: [0.5, 0, 0.75, 0],
					onFrame: (animation, frame): void => {
						const domContent = $(node);

						domContent.css({
							transform: `translateX(-${
								frame * 3
							}px)`,
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

	private createWhoAmISocial(): void {
		const socialDom = $('.sign > .whoAmI > .description.container > .socials.container');

		const revealScrollAnimator = new ScrollAnimator();
		const totalFrames = 240;

		Array.from(socialDom.children).forEach((node: Node, index: number) => {
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
						* ((totalFrames) / socialDom.childNodes.length)
					)) * 2,
					bezier: [0.75, 0, 0.25, 1],
					onFrame: (animation, frame): void => {
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

	private createWhatNowOutline(): void {
		const whatNowOutlineDom = $('.sign > .whatNow > .title.container > .outline');

		const revealScrollAnimator = new ScrollAnimator();
		const {
			textContent,
		} = whatNowOutlineDom;

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
						* ((totalFrames) / textContent.length)
					)) * 8,
					bezier: [0.75, 0, 0.25, 1],
					onFrame: (animation, frame): void => {
						const {
							totalFrames: animationTotalFrames,
						} = animation.items;

						const domContent = $(node);

						domContent.css({
							transform: `translateY(-${
								(animationTotalFrames - frame)
							}px)`,
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

	private createWhatNowTitle(): void {
		const titleDoms = $$('.sign > .whatNow > .title.container > .title:not(.outline)');

		titleDoms.fastEach((titleDom: $Object) => {
			const revealScrollAnimator = new ScrollAnimator();
			const {
				textContent,
			} = titleDom;

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
							* ((totalFrames) / textContent.length)
						)) * 4,
						bezier: [0.75, 0, 0.25, 1],
						onHidden: (): void => {
							const domContent = $(node);

							domContent.css({
								opacity: 0,
							});
						},
						onFrame: (animation, frame): void => {
							const {
								totalFrames: animationTotalFrames,
							} = animation.items;

							const domContent = $(node);

							domContent.css({
								transform: `translate(${
									((index % 2 ? 1 : -1)
										* (animationTotalFrames - frame))
									- (animationTotalFrames - frame)
								}px, ${
									((index % 2 ? -1 : 1)
										* (animationTotalFrames - frame))
									- (animationTotalFrames - frame)
								}px)`,
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

	private separateTextContentIntoSpans(domContent: $Object, mode: string): void {
		const {
			textContent,
			className,
		} = domContent;

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
		processedTextContent.fastEach((titleChar: string[1]) => {
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
