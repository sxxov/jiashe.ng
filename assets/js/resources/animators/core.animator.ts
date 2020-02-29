import {
	$,
	WindowUtility,
	BezierUtility,
} from '../utilities.js';
import { lottie } from '../lottie.js';
import {
	LottieFactory,
	SolidFactory,
	AnimationFactory,
} from '../animators.factories.js';
import {
	LottieObject,
	SolidObject,
	AnimationObject,
} from '../animator.types.js';
import { $Object } from '../utilities.types.js';

// TODO: investigate issue of lottie disappearing when mobile scroll hits innerHeight,
//		 but reappears after viewport becomes innerHeight

export class CoreAnimator {
	lottie: any;
	protected mWindowUtility: WindowUtility;
	uid: string;

	currentFrame: number;
	totalFrames: number;
	framesPerAnimation: number;

	animations: AnimationObject[][];
	metaAnimations: AnimationObject[];
	animatorClassPrefix: string;
	animatorContainers: $Object[];
	animatorContainersWrapper: $Object;
	visibleAnimations: AnimationObject[];

	dpr: number;
	dprMultiplier: number;

	rawAnimateInstance: number;

	attributeCache: Record<string, any[]>;

	constructor() {
		this.lottie = lottie;
		this.mWindowUtility = new WindowUtility();
		this.uid = Date.now().toString();

		this.currentFrame = 0;
		this.totalFrames = 0;
		this.framesPerAnimation = 120;

		this.animations = [];
		this.metaAnimations = [];
		this.animatorClassPrefix = '__animate';
		this.animatorContainers = [];
		this.animatorContainersWrapper = null;
		this.visibleAnimations = null;

		this.dpr = Math.max(window.devicePixelRatio / 2, 1);
		this.dprMultiplier = this.dpr;

		this.rawAnimateInstance = null;

		this.attributeCache = {};

		this.createContainerWrapperDom();

		$(window).on('load resize', () => window.requestAnimationFrame(() => {
			this.onWindowResize.call(this);

			if (this.visibleAnimations !== null) {
				this.visibleAnimations.forEach((animation) => {
					animation.items.onRedraw.call(this, animation);
				});
			}
		}));
	}

	createContainerWrapperDom(): void {
		this.animatorContainersWrapper = $(document.createElement('div'));

		this.animatorContainersWrapper.addClass([
			this.animatorClassPrefix,
			'containerWrapper',
			this.uid,
		]);

		this.activate(this.animatorContainersWrapper);

		document.body.appendChild(this.animatorContainersWrapper);
	}

	createAndReturnNewContainerDom({
		invert = false,
		...options
	}): $Object {
		const animatorContainer = $(document.createElement('div'));

		Object.keys(options).forEach((optionKey) => {
			animatorContainer[optionKey] = options[optionKey];
		});

		animatorContainer.addClass([
			this.animatorClassPrefix,
			'container',
			this.uid,
			'height',
		]);

		if (invert === true) {
			animatorContainer.addClass('invert');
		}

		this.activate(animatorContainer);

		this.animatorContainersWrapper.appendChild(animatorContainer);

		this.animatorContainers.push(animatorContainer);

		return animatorContainer;
	}

	async add(animationToBeConstructed: AnimationObject): Promise<void> {
		const mAnimationFactory = new AnimationFactory();
		const animationObject = mAnimationFactory.create(animationToBeConstructed, this);
		const {
			type,
			index,
			items,
		} = animationObject;

		let lottieObject: LottieObject = null;
		let solidObject: SolidObject = null;

		switch (type) {
		case 'null':
			break;
		case 'meta':
			break;
		case 'solid':
			// TODO: implement 'solid'
			solidObject = await (new SolidFactory(this)).create(animationObject);

			animationObject.items = {
				...animationObject.items,
				domContent: solidObject.domContent,
			};
			break;
		case 'lottie':
			lottieObject = await (new LottieFactory(this)).create(animationObject);

			animationObject.items = {
				...animationObject.items,
				totalFrames: lottieObject.totalFrames,
				domContent: lottieObject.domContent,
				onFrame: (animationItem: AnimationObject, frame: number): void => {
					lottieObject.onFrame(animationItem, frame);

					items.onFrame(animationItem, frame);
				},
				onRedraw: (animationItem: AnimationObject): void => {
					this.onRedraw(animationItem);

					items.onRedraw(animationItem);
				},
				object: {
					lottie: lottieObject,
				},
			};
			break;
		default:
		}

		switch (true) {
		case type === 'meta':
			this.metaAnimations.push(animationObject);
			break;
		case index === null:
			// add to the end of the array
			this.animations.push([animationObject]);
			break;
		case this.animations[index] === undefined:
			// add a nested array to the index
			this.animations[index] = [animationObject];
			break;
		case this.animations[index].constructor === Array:
			// add to the nested array at the index
			this.animations[index].push(animationObject);
			break;
		default:
		}

		this.attributeCache = {};

		// add up the 'totalFrames' of every animation
		this.totalFrames = this.getAttributeFromAnimationsItems('totalFrames', this.animations)
			.reduce((accumulator, currentValue) => currentValue + accumulator, 0);

		this.onNewAnimation(animationObject);
	}

	getRelativeFrame(frame: number): number {
		return frame * this.totalFrames;
	}

	async rawAnimate(items: {
		from: number;
		to: number;
		options?: {
			fps?: number;
			bezier?: number[];
		};
	}, callback: (frame: number) => void): Promise<void> {
		const {
			from,
			to,
			options: {
				fps = 120,
				bezier = [],
			} = {},
		} = items;

		if (items.options === undefined) {
			return this.rawAnimate({
				from,
				to,
				options: {},
			}, callback);
		}

		if (from === to) {
			return new Promise((resolve) => resolve());
		}

		if (this.rawAnimateInstance !== null) {
			clearInterval(this.rawAnimateInstance);
		}

		let processedCallback = callback;

		if (bezier !== []
			&& bezier.length === 4) {
			const mBezierUtility = new BezierUtility(
				bezier[0], bezier[1], bezier[2], bezier[3],
			);

			processedCallback = (frame): void => callback(
				mBezierUtility.getValue(
					// offset frame so it starts from 'from'
					(frame - from)
					// divide by, the amount of frames in between 'to' & 'from'
					/ (to - from),
				// times it all back with, the amount of frames in between 'to' & 'from',
				// after getting the bezier-altered value
				) * (to - from),
			);
		}

		return new Promise((resolve) => {
			let i = from;
			const step = (): void => {
				processedCallback(i);
				if (i > to) {
					resolve();
					return;
				}

				i += 1 * (fps / 60);
				window.requestAnimationFrame(step);
			};

			window.requestAnimationFrame(step);
		});
	}

	onNewAnimation(animation: AnimationObject): void {
		const {
			onRedraw,
			domContent,
		} = animation.items;

		if (domContent !== null) {
			this.hide(domContent);
		}

		onRedraw(animation);
		this.onWindowResize();

		this.visibleAnimations = null;
		this.onFrame(this.currentFrame);
	}

	onWindowResize(): void {
		if (!this.animatorContainers) {
			return;
		}

		const viewportHeight = this.mWindowUtility.viewport.height;
		const innerHeight = this.mWindowUtility.inner.height;

		this.animatorContainers.forEach((animatorContainer) => {
			// TODO: implement { maximumWidth, minimumWidth, maximumHeight, minimumHeight }

			// const containerHeight = animatorContainer.css('height', { computed: true });
			// const containerWidth = animatorContainer.css('width', { computed: true });

			// animatorContainer.css('height',
			// 	containerHeight);

			// animatorContainer.css('width',
			// 	containerWidth);

			if (viewportHeight === innerHeight) {
				animatorContainer.addClass('viewport');
				animatorContainer.removeClass('inner');
			} else {
				animatorContainer.addClass('inner');
				animatorContainer.removeClass('viewport');
			}
		});

		this.lottie.resize();
	}

	onRedraw(animation: AnimationObject): void {
		const {
			respectDevicePixelRatio,
			object,
			domContent,
		} = animation.items;

		if (!object.lottie) {
			return;
		}

		const lottieObjectDom = domContent;

		if (respectDevicePixelRatio !== false) {
			const lottieObjectContainerWrapperWidth = this.animatorContainersWrapper.clientWidth;
			const lottieObjectContainerWrapperHeight = this.animatorContainersWrapper.clientHeight;

			const lottieObjectWidth = parseFloat(lottieObjectDom.css('width', { computed: true }) as string) / this.dprMultiplier;
			const lottieObjectHeight = parseFloat(lottieObjectDom.css('height', { computed: true }) as string) / this.dprMultiplier;

			const offsetWidth = -(lottieObjectWidth - lottieObjectContainerWrapperWidth) / 2;
			const offsetHeight = -(lottieObjectHeight - lottieObjectContainerWrapperHeight) / 2;

			lottieObjectDom.css({
				transform: `translate(${offsetWidth}px, ${offsetHeight}px) scale(${1 / this.dprMultiplier})`,
			});
		}
	}

	onFrame(frame: number): void {
		if (!(this.animations.length > 0)) {
			return;
		}

		let animationIndex: number = null;
		let currentAnimationsTotalFrames: number = null;
		let workingAnimations: AnimationObject[] = [];
		const uids: string[] = [];

		// TODO: optimize below code, use caching or something

		if (frame === 0) {
			animationIndex = -1;
			currentAnimationsTotalFrames = 0;
			workingAnimations = this.animations[-1];
		} else {
			// get an array of the 'totalFrames' of every animation,
			// and then find the total frames and the index of the current animation
			this.getAttributeFromAnimationsItems('totalFrames', this.animations).reduce(
				(accumulator, currentValue, i) => {
				// if the current accumulated value is more than the frame,
				// it means that we've overshot and the previous index is the current animation
					if (currentValue + accumulator >= frame - 1) {
						if (animationIndex === null) {
							animationIndex = i;
							currentAnimationsTotalFrames = currentValue + accumulator;
						}
						return 0;
					}

					// not there yet, continue accumulating
					return currentValue + accumulator;
				},
				0,
			);
			workingAnimations = this.animations[animationIndex];
		}

		if (!workingAnimations) {
			return;
		}

		workingAnimations.forEach((workingAnimation: AnimationObject) => {
			const {
				__caller,
				uid,
				totalFrames,
				onFrame,
				offset,
			} = workingAnimation.items;

			if (frame < offset) {
				return;
			}

			uids.push(uid);

			const globalFrame = frame - offset;
			const localFrame = (
				(globalFrame - this.getTotalFramesBeforeIndex(animationIndex))
				/ ((
					currentAnimationsTotalFrames
					- this.getTotalFramesBeforeIndex(animationIndex)
				) - offset)
			)
			* totalFrames;

			// if (__caller.name !== 'FrameAnimator'
			// 	|| uid === 'logo'
			// 	|| uid === 'scrollCounter') {
			// 	console.log('frame', frame);
			// 	console.log('workingAnimation', workingAnimation);
			// 	console.log('globalFrame', globalFrame);
			// 	console.log('animationIndex', animationIndex);
			// 	console.log('localFrame', localFrame);
			// 	console.log('currentAnimationsTotalFrames', currentAnimationsTotalFrames);
			// 	console.log('this.visibleAnimations', this.visibleAnimations);
			// 	console.log('this.animations', this.animations);
			// 	console.log('');
			// }

			this.currentFrame = frame;
			this.onVisibleAnimationsChange(workingAnimations);

			onFrame(
				workingAnimation, localFrame,
			);
		});

		this.metaAnimations.forEach((metaAnimation) => {
			const {
				onFrame,
			} = metaAnimation.items;
			const mAnimationFactory = new AnimationFactory();
			const animation = mAnimationFactory.create({
				type: 'meta',
				index: animationIndex,
				items: {
					uid: uids.join(' '),
					totalFrames: currentAnimationsTotalFrames
						- this.getTotalFramesBeforeIndex(animationIndex),
				},
			}, this);

			onFrame(animation, frame - this.getTotalFramesBeforeIndex(animationIndex));
		});
	}

	private getAttributeFromAnimationsItems(
		attributeKey: string,
		animations: AnimationObject[][],
	): any[] {
		if (this.attributeCache[attributeKey]) {
			return this.attributeCache[attributeKey];
		}

		return animations.map(
			(animation) => Math.max(
				...animation.map(
					(workingAnimation) => (
						workingAnimation.items[attributeKey]
					),
				),
			),
		);
	}

	private getTotalFramesBeforeIndex(index: number): number {
		const totalFrames: number[] = this.getAttributeFromAnimationsItems('totalFrames', this.animations);
		let previousFrames: number = null;

		totalFrames.reduce(
			(accumulator, currentValue, i) => {
				if (i >= index) {
					if (previousFrames === null) {
						previousFrames = accumulator;
					}
					return 0;
				}

				// not there yet, continue accumulating
				return currentValue + accumulator;
			},
			0,
		);

		return previousFrames;
	}

	onVisibleAnimationsChange(animations: AnimationObject[]): void {
		if (this.visibleAnimations === animations) {
			return;
		}

		animations.forEach((animation) => {
			const {
				onVisible,
				onRedraw,
				domContent,
			} = animation.items;

			onVisible(animation);
			onRedraw(animation);

			if (domContent === null) {
				return;
			}

			this.unhide(domContent);
		});

		if (this.visibleAnimations === null) {
			this.visibleAnimations = animations;

			return;
		}

		if (this.visibleAnimations === animations) {
			return;
		}

		this.visibleAnimations.forEach((visibleAnimation) => {
			const {
				onHidden,
				domContent,
			} = visibleAnimation.items;

			onHidden(visibleAnimation);

			if (domContent === null) {
				return;
			}

			this.hide(domContent);
		});
		this.visibleAnimations = animations;
	}

	hide(domElement: HTMLUnknownElement): $Object {
		return $(domElement).addClass('hidden');
	}

	unhide(domElement: HTMLUnknownElement): $Object {
		return $(domElement).removeClass('hidden');
	}

	activate(domElement: HTMLUnknownElement): $Object {
		return $(domElement).addClass('active');
	}

	deactivate(domElement: HTMLUnknownElement): $Object {
		return $(domElement).removeClass('active');
	}
}
