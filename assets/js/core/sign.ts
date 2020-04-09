import { $Object } from '../resources/utilities.types.js';
import { ScrollAnimator } from '../resources/animators.js';
import {
	$,
	$$,
	WindowUtility,
} from '../resources/utilities.js';

export class Sign {
	public static PREFIX = '__sign';
	private mWindowUtility = new WindowUtility();

	private placeholders = {
		pixels: (): number => Math.floor(document.body.clientHeight
			- this.mWindowUtility.viewport.height
			- window.scrollY),
	};

	private descriptionDomCache: [{
		domContent: $Object;
		textContent: string;
	}?] = [];

	private totalFrames = 240;

	public async create(): Promise<void> {
		if (document.readyState === 'loading') {
			await new Promise((resolve) => $(window).on('domcontentloaded', resolve));
		}

		this.createAnimations();
		this.createPlaceholderReplacers();
	}

	private createPlaceholderReplacers(): void {
		this.cacheDescriptionPlaceholders();
		this.updateDescriptionPlaceholders();
		$(window).on('scroll', () => this.updateDescriptionPlaceholders.call(this));
	}

	private createAnimations(): void {
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

	private createWhoAmITitle(): void {
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

		titleDoms.fastEach((titleDom: $Object) => {
			this.separateTextContentIntoSpans(titleDom, 'letter');

			titleDom.childNodes.forEach((node, index) => {
				// add reveal animations
				charRevealScrollAnimator.add({
					index: 0,
					type: 'null',
					items: {
						totalFrames,
						offset: -((totalFrames
							* (1 - (index) / (titleDom.childNodes.length - 1))
						)) / 4,
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
									(
										(index % 2 ? 1 : -1)
										* (animationTotalFrames - frame)
										* 4
									)
									/ window.devicePixelRatio
								}px)`,
								opacity: Number(frame > 10),
							});
						},
					},
				});
			});
		});
	}

	private createDescriptions(): void {
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

		descriptionDoms.fastEach((descriptionDom: $Object, i: number) => {
			this.separateTextContentIntoSpans(descriptionDom, 'block');

			const textNodes = Array.from(descriptionDom.childNodes)
				.getAll((node: Node) => node.nodeName.toLowerCase() !== 'br');

			textNodes.fastEach((node: Node, index: number) => {
				// add reveal animations
				charRevealScrollAnimator.add({
					index: i,
					type: 'null',
					items: {
						totalFrames,
						offset: -((totalFrames
							* (1 - (index) / (textNodes.length - 1))
						)) / 4,
						bezier: [0.75, 0, 0.25, 1],
						onFrame: (animation, frame): void => {
							const {
								totalFrames: animationTotalFrames,
							} = animation.items;

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

	private createWhoAmIOutline(): void {
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
						* ((index) / (whoAmIOutlineDom.childNodes.length - 1))
					)) / 2,
					bezier: [0.75, 0, 0.25, 1],
					onFrame: (animation, frame): void => {
						const domContent = $(node);

						domContent.css({
							transform: `translateX(-${
								frame * 2
							}px)`,
							opacity: Number(frame < 239),
						});
					},
				},
			});
		});
	}

	private createWhoAmISocial(): void {
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

		Array.from(socialDom.children).fastEach((node: Node, index: number) => {
			// add reveal animations
			iconRevealAnimator.add({
				index: 1,
				type: 'null',
				items: {
					totalFrames,
					offset: -((totalFrames
						* (1 - (index) / (socialDom.children.length))
					)) + 60,
					bezier: [0.75, 0, 0.25, 1],
					onHidden: (): void => {
						const domContent = $(node);

						domContent.css({
							transform: 'translateY(0px)',
						});
					},
					onFrame: (animation, frame): void => {
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

	private createWhatNowOutline(): void {
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
					onVisible: (): void => {
						const domContent = $(node);

						domContent.css({
							opacity: 0,
						});
					},
					totalFrames,
				},
			});
			const offset = -((totalFrames
				* (1 - (index) / (whatNowOutlineDom.childNodes.length - 1))
			)) / 2;
			revealScrollAnimator.add({
				index: 1,
				type: 'null',
				items: {
					totalFrames,
					offset,
					bezier: [0.75, 0, 0.25, 1],
					onFrame: (animation, frame): void => {
						const {
							totalFrames: animationTotalFrames,
						} = animation.items;

						const domContent = $(node);

						domContent.css({
							transform: `translateY(-${
								(animationTotalFrames - frame)
								* 2
							}px)`,
							opacity: Number(frame > 60 - offset),
						});
					},
				},
			});
		});
	}

	private createWhatNowTitle(): void {
		const titleDoms = $$('.sign > .whatNow > .title.container > .title:not(.outline)');

		titleDoms.fastEach((titleDom: $Object) => {
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
							* (1 - (index) / (titleDom.childNodes.length - 1))
						)) / 2,
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
								transform: `translate${
									index % 2 ? 'Y' : 'X'
								}(-${
									(
										(animationTotalFrames - frame)
										* 2
									)
									/ window.devicePixelRatio
								}px)`,
								opacity: Number(frame > 10),
							});
						},
					},
				});
			});
		});
	}

	private cacheDescriptionPlaceholders(): void {
		const descriptionDoms = $$('.sign > * > .description.container > .description');

		descriptionDoms.fastEach((descriptionDom: $Object) => {
			(descriptionDom as unknown as HTMLParagraphElement)
				.childNodes
				.forEach((node) => {
					const {
						textContent,
					} = node as HTMLElement;

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

	private updateDescriptionPlaceholders(): void {
		this.descriptionDomCache.fastEach((descriptionDomCache: {
			domContent: $Object;
			textContent: string;
		}) => {
			const {
				domContent,
				textContent,
			} = descriptionDomCache;

			// +2 is to shift over '{{' & '}}' itself
			const indexOfKeyword = textContent.indexOf('{{') + 2;
			const indexOfRest = textContent.indexOf('}}') + 2;

			if (indexOfKeyword === -1) {
				return;
			}

			// substr is faster https://www.measurethat.net/Benchmarks/Show/2335/1/slice-vs-substr-vs-substring-with-no-end-index
			const keyword = textContent
				.substr(
					indexOfKeyword,
					indexOfRest - 2 - indexOfKeyword,
				);
			let result = null;

			Object.keys(this.placeholders)
				.fastEach((key: string) => {
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
