import { TV } from './tv.js';
import { Hamburger } from './hamburger.js';
import {
	ScrollAnimator,
	FrameAnimator,
} from '../resources/animators.js';
import {
	$,
	WindowUtility,
	ForUtility,
} from '../resources/utilities.js';


class Main {
	mTV: TV;
	hamburger: Hamburger;
	miscellaneousScrollingAnimator: ScrollAnimator;
	scrollToContinueFrameAnimator: FrameAnimator;
	mWindowUtility: WindowUtility;

	constructor() {
		(new ForUtility()).addToArrayPrototype();
		this.mTV = new TV();
		this.hamburger = new Hamburger();
		this.miscellaneousScrollingAnimator = new ScrollAnimator();
		this.scrollToContinueFrameAnimator = new FrameAnimator();
		this.mWindowUtility = new WindowUtility();
	}

	async init(): Promise<void> {
		await this.mTV.init();
		await this.addScrollToContinueFrameAnimation();
		await this.addHeaderFrameAnimation();
		await this.addMiscellaneousScrollingAnimations();
	}

	async addMiscellaneousScrollingAnimations(): Promise<void> {
		const mScrollAnimator = this.miscellaneousScrollingAnimator;

		// meta
		await mScrollAnimator.add({
			type: 'meta',
			items: {
				onFrame: ((animation, frame): void => {
					const {
						uid,
						totalFrames,
					} = animation.items;

					let scrollPercent = ((
						frame / totalFrames
					) * 100)
						.toString();

					switch (true) {
					case scrollPercent === 'NaN'
						|| scrollPercent === '0':
						scrollPercent = '.00';
						break;
					case scrollPercent.substr(0, 2) === '0.':
						scrollPercent = scrollPercent
							.substr(1)
							.substring(0, 3);
						break;
					case scrollPercent.substring(1, 2) === '.':
						scrollPercent = scrollPercent
							.substring(0, 3);
						break;
					case scrollPercent === '100':
						break;
					default:
						scrollPercent = scrollPercent
							.substr(0, scrollPercent.indexOf('.'))
							.padStart(3, '0');
					}

					($('.scrollCounter > h1') as HTMLElement).innerHTML = `${scrollPercent}%`;
					[($('.scrollCounter > h2') as HTMLElement).innerHTML] = uid.split(' ');
				}),
			},
		});

		// pre
		await mScrollAnimator.add({
			index: -1,
			type: 'null',
			items: {
				uid: 'welcome',
				onVisible: (): void => {
					this.scrollToContinueFrameAnimator.animatorContainers.forEach(
						(animatorContainer) => this.scrollToContinueFrameAnimator.activate(
							animatorContainer,
						),
					);
				},
				onHidden: (): void => {
					this.scrollToContinueFrameAnimator.animatorContainers.forEach(
						(animatorContainer) => this.scrollToContinueFrameAnimator.deactivate(
							animatorContainer,
						),
					);
				},
			},
		});

		// custom uid for index 0
		await mScrollAnimator.add({
			type: null,
			index: 0,
			items: {
				uid: 'intro',
			},
		});

		// blocks
		await mScrollAnimator.add({
			index: 0,
			type: 'lottie',
			data: await $().getJSON('/assets/js/raw/lottie/blocks.json'),
			items: {
				uid: 'blocks',
				respectDevicePixelRatio: false,
				totalFrames: 150,
			},
		});

		// hello
		await mScrollAnimator.add({
			index: 0,
			type: 'lottie',
			data: await $().getJSON('/assets/js/raw/lottie/hello.json'),
			items: {
				uid: 'hello',
				invert: true,
				totalFrames: 120,
			},
		});

		// overlayController
		await mScrollAnimator.add({
			index: 0,
			type: 'null',
			items: {
				uid: 'overlayController',
				totalFrames: 120,
				onFrame: (animation, frame): void => {
					$('.overlay').css({
						opacity: Math.min((frame / mScrollAnimator.totalFrames) * 2, 0.5),
					});
				},
			},
		});

		// placeholder
		await mScrollAnimator.add({
			index: 1,
			type: 'solid',
			items: {
				uid: 'blockso',
				respectDevicePixelRatio: false,
				totalFrames: 150,
			},
		});
	}

	async addScrollToContinueFrameAnimation(): Promise<void> {
		const mFrameAnimator = this.scrollToContinueFrameAnimator;

		// scrollToContinue
		await mFrameAnimator.add({
			index: 0,
			type: 'lottie',
			data: await $().getJSON('/assets/js/raw/lottie/scroll to continue.json'),
			items: {
				uid: 'scrollToContinue',
				respectDevicePixelRatio: true,
				totalFrames: 180,
				width: {
					maximum: 1300,
				},
				onVisible: (animation): void => {
					const {
						onRedraw,
					} = animation.items;

					onRedraw(animation);

					mFrameAnimator.animatorContainersWrapper.addClass('invert');
				},
				onRedraw: (animation): void => {
					const {
						domContent,
					} = animation.items;

					domContent.css({
						transform: `translateY(${this.mWindowUtility.viewport.height / 3}px)`,
					});
				},
			},
		});
		mFrameAnimator.repeat(0, 180);
	}

	async addHeaderFrameAnimation(): Promise<void> {
		const mFrameAnimator = new FrameAnimator();

		// logo
		await mFrameAnimator.add({
			index: 0,
			type: 'null',
			items: {
				uid: 'logo',
				totalFrames: 120,
				domContent: $('.logo'),
				onVisible: (animation): void => {
					const {
						domContent,
					} = animation.items;

					domContent.removeClass('hidden');
					$(domContent.childNodes[1]).css({
						fill: 'white',
					});
				},
				onFrame: (animation, frame): void => {
					const {
						domContent,
						totalFrames,
					} = animation.items;
					const finalPosition = 120;

					domContent.css({
						transform: `translateY(${((frame / totalFrames) * finalPosition) - finalPosition}px)`,
					});
				},
			},
		});

		// scrollCounter
		await mFrameAnimator.add({
			index: 0,
			type: 'null',
			items: {
				uid: 'scrollCounter',
				totalFrames: 120,
				offset: 40,
				domContent: $('.scrollCounter'),
				onVisible: (animation): void => {
					const {
						domContent,
					} = animation.items;

					domContent.removeClass('hidden');
					$(domContent.childNodes[1]).css({
						fill: 'white',
					});
					$(domContent.childNodes[3]).css({
						fill: 'white',
					});
					domContent.css({
						transform: 'translateY(-10000px)',
					});
				},
				onFrame: (animation, frame): void => {
					const {
						domContent,
						totalFrames,
					} = animation.items;
					const finalPosition = -120;

					domContent.css({
						transform: `translateY(${((frame / totalFrames) * finalPosition) - finalPosition}px)`,
					});
				},
			},
		});

		// hamburger menu
		await mFrameAnimator.add({
			index: 0,
			type: 'null',
			data: await this.hamburger.getLottieData(),
			items: {
				uid: 'hamburger',
				totalFrames: 120,
				offset: 80,
				domContent: this.hamburger.containerDom,
				onVisible: (animation): void => {
					const {
						items,
						data,
					} = animation;

					const {
						domContent,
					} = items;

					domContent.removeClass('hidden');
					domContent.css({
						transform: 'translateY(-10000px)',
					});

					this.hamburger.create(data);
				},
				onFrame: (animation, frame): void => {
					const {
						domContent,
						totalFrames,
					} = animation.items;
					const finalPosition = 120;

					domContent.css({
						transform: `translateY(${((frame / totalFrames) * finalPosition) - finalPosition}px)`,
					});
				},
			},
		});

		// to control the header grid size, for css animation on mobile when the url bar appears
		await mFrameAnimator.add({
			index: 0,
			type: 'null',
			items: {
				onRedraw: (): void => {
					const viewportHeight = this.mWindowUtility.viewport.height;
					const innerHeight = this.mWindowUtility.inner.height;

					const headerGrid = $('.headerGrid');

					if (viewportHeight === innerHeight) {
						// headerGrid.addClass('viewport');
						// headerGrid.removeClass('inner');
						headerGrid.css({
							height: viewportHeight,
						});
					} else {
						// headerGrid.addClass('inner');
						// headerGrid.removeClass('viewport');
						headerGrid.css({
							height: innerHeight,
						});
					}
				},
			},
		});

		mFrameAnimator.animate(0, 120, {
			bezier: [0.77, 0, 0.175, 1],
		});
	}
}

(async (): Promise<void> => {
	await (new Main()).init();
})();
