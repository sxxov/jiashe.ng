import { TV } from './tv.js';
import {
	ScrollAnimator,
	FrameAnimator,
} from '../resources/animators.js';
import {
	$,
	WindowUtility,
} from '../resources/utilities.js';


class Main {
	mTV: TV;
	miscellaneousScrollingAnimator: ScrollAnimator;
	scrollToContinueFrameAnimator: FrameAnimator;
	mWindowUtility: WindowUtility;

	constructor() {
		this.mTV = new TV();
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
		// custom uid for group
		await mScrollAnimator.add({
			type: null,
			index: 0,
			items: {
				uid: 'intro',
			},
		});
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
		await mScrollAnimator.add({
			index: 1,
			type: 'lottie',
			data: await $().getJSON('/assets/js/raw/lottie/blocks.json'),
			items: {
				uid: 'blockso',
				respectDevicePixelRatio: false,
				totalFrames: 150,
			},
		});
	}

	async addScrollToContinueFrameAnimation(): Promise<void> {
		const mFrameAnimator = this.scrollToContinueFrameAnimator;

		await mFrameAnimator.add({
			index: 0,
			type: 'lottie',
			data: await $().getJSON('/assets/js/raw/lottie/scroll to continue.json'),
			items: {
				uid: 'scrollToContinue',
				respectDevicePixelRatio: true,
				totalFrames: 180,
				maximumWidth: 1000,
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

		await mFrameAnimator.add({
			index: 0,
			type: 'null',
			items: {
				uid: 'scrollCounter',
				totalFrames: 120,
				offset: 60,
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
						transform: `translateY(${(((frame / totalFrames)) * finalPosition) - finalPosition}px)`,
					});
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
