import {
	$,
	WindowUtility,
	BezierUtility,
} from '../utilities.js';
import { lottie } from '../../raw/libraries/lottie.js';
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

export class CoreAnimator {
	public static PREFIX = '__animate';

	protected mWindowUtility = new WindowUtility();
	public uid = Math.round(performance.now()).toString();

	public currentFrame = 0;
	public totalFrames = 0;

	public animations: AnimationObject[][] = [];
	public metaAnimations: AnimationObject[] = [];
	public animatorContainers: $Object[] = [];
	private __animatorContainersWrapper: $Object = null;
	public visibleAnimations: AnimationObject[] = [];

	public dpr = Math.max(window.devicePixelRatio / 2, 1);
	public dprMultiplier = this.dpr;

	protected rafId: number = null;

	private attributeCache: Record<string, any[]> = {};

	constructor() {
		$(window).on('load resize', () => window.requestAnimationFrame(() => {
			this.onWindowResize.call(this);

			if (this.visibleAnimations !== null) {
				this.visibleAnimations.forEach((animation) => {
					animation.items.onRedraw.call(this, animation);
				});
			}
		}));
	}

	public get animatorContainersWrapper(): $Object {
		if (this.__animatorContainersWrapper) {
			return this.__animatorContainersWrapper;
		}

		this.__animatorContainersWrapper = $(document.createElement('div'));

		this.__animatorContainersWrapper.addClass([
			CoreAnimator.PREFIX,
			'containersWrapper',
			this.uid,
			'height',
		]);

		this.activate(this.__animatorContainersWrapper);

		$('.organs').appendChild(this.__animatorContainersWrapper);

		return this.__animatorContainersWrapper;
	}

	public async add(animationToBeConstructed: AnimationObject): Promise<void> {
		const mAnimationFactory = new AnimationFactory(this);
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
			solidObject = await (new SolidFactory(this)).create(animationObject);

			animationObject.items = {
				...items,
				domContent: solidObject.domContent,
			};
			break;
		case 'lottie':
			lottieObject = await (new LottieFactory(this)).create(animationObject);

			animationObject.items = {
				...items,
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

		this.onAdd(animationObject);
	}

	public onAdd(animation: AnimationObject): void {
		this.onNewAnimation(animation);
		// to be overriden
	}

	public getRelativeFrame(frame: number): number {
		return frame * this.totalFrames;
	}

	public async rawAnimate(items: {
		from: number;
		to: number;
		options?: {
			fps?: number;
			bezier?: number[];
			speed?: number;
		};
	}, callback: (frame: number) => void): Promise<void> {
		const {
			from,
			to,
			options: {
				fps = 120,
				speed = 1,
			} = {},
		} = items;

		const inverted = to < from;
		const processedFrom = inverted ? to : from;
		const processedTo = inverted ? from : to;

		if (items.options === undefined) {
			return this.rawAnimate({
				from: processedFrom,
				to: processedTo,
				options: {},
			}, callback);
		}

		if (processedFrom === processedTo) {
			callback(processedTo);
			return new Promise((resolve) => resolve());
		}

		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
		}

		return new Promise((resolve) => {
			let i = processedFrom;
			const step = (): void => {
				callback(inverted ? processedTo - i : i);
				if (i >= processedTo) {
					resolve();
					return;
				}

				i += (1 * speed) * (fps / 60);
				this.rafId = window.requestAnimationFrame(step);
			};

			this.rafId = window.requestAnimationFrame(step);
		});
	}

	private onNewAnimation(animation: AnimationObject): void {
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

	private onWindowResize(): void {
		if (this.animatorContainers.length < 1) {
			return;
		}

		const viewportHeight = this.mWindowUtility.viewport.height;
		const innerHeight = this.mWindowUtility.inner.height;

		if (viewportHeight === innerHeight) {
			this.animatorContainersWrapper.removeClass('innerCenter');
		} else {
			this.animatorContainersWrapper.addClass('innerCenter');
		}

		this.animatorContainers.fastEach((animatorContainer: $Object, i: number) => {
			if (!(this.animations
				&& this.animations[i])) {
				return;
			}

			this.animations.fastEach((workingAnimations: AnimationObject[]) => {
				workingAnimations.fastEach((workingAnimation: AnimationObject) => {
					const {
						__container,
						width,
						height,
					} = workingAnimation.items;

					if (!__container) {
						return;
					}

					let workingWidth = null;
					let workingHeight = null;

					workingWidth = getValueWithinRange({
						minimum: width.minimum,
						maximum: width.maximum,
						value: this.mWindowUtility.inner.width,
					});

					workingHeight = getValueWithinRange({
						minimum: height.minimum,
						maximum: height.maximum,
						value: this.mWindowUtility.inner.height,
					});

					__container.css(
						'width',
						workingWidth == null
							? ''
							: workingWidth,
					);

					__container.css(
						'height',
						workingHeight === null
							? ''
							: workingHeight,
					);
				});
			});
		});

		lottie.resize();

		function getValueWithinRange({
			minimum,
			maximum,
			value,
		}: {
			minimum: number;
			maximum: number;
			value: number;
		}): number {
			if (minimum === null
				|| maximum === null) {
				return null;
			}

			let workingAttributeValue = null;

			if (maximum) {
				workingAttributeValue = Math.min(value, maximum);
			}

			if (minimum) {
				workingAttributeValue = Math.max(value, minimum);
			}

			return workingAttributeValue;
		}
	}

	private onRedraw(animation: AnimationObject): void {
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
			const lottieObjectContainersWrapperWidth = this.animatorContainersWrapper.clientWidth;
			const lottieObjectContainersWrapperHeight = this.animatorContainersWrapper.clientHeight;

			const lottieObjectWidth = parseFloat(lottieObjectDom.css('width', { computed: true }) as string) / this.dprMultiplier;
			const lottieObjectHeight = parseFloat(lottieObjectDom.css('height', { computed: true }) as string) / this.dprMultiplier;

			const offsetWidth = -(lottieObjectWidth - lottieObjectContainersWrapperWidth) / 2;
			const offsetHeight = -(lottieObjectHeight - lottieObjectContainersWrapperHeight) / 2;

			lottieObjectDom.css({
				transform: `translate(${offsetWidth}px, ${offsetHeight}px) scale(${1 / this.dprMultiplier})`,
			});
		}
	}

	protected onFrame(frame: number): void {
		if (!(this.animations.length > 0)) {
			return;
		}

		let animationIndex: number = null;
		let currentAnimationsTotalFrames: number = null;
		let workingAnimations: AnimationObject[] = [];
		const uids: string[] = [];

		// TODO: optimize below code, use caching or something

		if (frame <= 0) {
			animationIndex = -1;
			currentAnimationsTotalFrames = 0;
			workingAnimations = this.animations[-1];
		} else {
			// get an array of the 'totalFrames' of every animation,
			// and then find the total frames and the index of the current animation
			const animationTotalFrames = this.getAttributeFromAnimationsItems('totalFrames', this.animations);
			animationTotalFrames.reduce(
				(accumulated, currentValue, i) => {
					const accumulating = currentValue + accumulated;

					// if the current accumulated value is more than the frame,
					// it means that we've overshot and the previous index is the current animation
					if (accumulating > frame
						// if i is the last index in the array,
						// we cut straight to it so it won't overshoot again and surpass this.animations
						// because the accumulating amount won't exeed the frame
						|| i === animationTotalFrames.length - 1) {
						if (animationIndex === null) {
							animationIndex = i;
							currentAnimationsTotalFrames = currentValue + accumulated;
						}
						return 0;
					}

					// not there yet, continue accumulating
					return accumulating;
				},
				0,
			);
			workingAnimations = this.animations[animationIndex];
		}

		if (!workingAnimations) {
			return;
		}

		const maxOffset = Math.max(...this.getAttributeFromAnimationsItems('offset', this.animations));

		workingAnimations.forEach((workingAnimation: AnimationObject) => {
			const {
				__caller,
				uid,
				totalFrames,
				onFrame,
				offset,
				bezier,
			} = workingAnimation.items;

			uids.push(uid);

			const mBezierUtility = new BezierUtility(
				bezier[0], bezier[1], bezier[2], bezier[3],
			);

			const globalFrame = frame;
			let localFrame = mBezierUtility.getValue(Math.min(
				((
					(
						globalFrame
						- this.getTotalFramesBeforeIndex(animationIndex)
					) / ((
						currentAnimationsTotalFrames
						- this.getTotalFramesBeforeIndex(animationIndex)
					) - maxOffset + offset)
				)
				* (totalFrames)),
				totalFrames,
			) / totalFrames) * totalFrames;
			localFrame = Number.isNaN(localFrame) ? totalFrames : localFrame;

			if ((window as any).DEBUG === true
				&& __caller.name !== 'FrameAnimator') {
				console.log('frame', frame);
				console.log('__caller', __caller.name);
				console.log('workingAnimation', workingAnimation);
				console.log('globalFrame', globalFrame);
				console.log('animationIndex', animationIndex);
				console.log('localFrame', localFrame);
				console.log('currentAnimationsTotalFrames', currentAnimationsTotalFrames);
				console.log('this.visibleAnimations', this.visibleAnimations);
				console.log('this.animations', this.animations);
				console.log('this.totalFrames', this.totalFrames);
				console.log('');
			}

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
			const mAnimationFactory = new AnimationFactory(this);
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

	protected getTotalFramesBeforeIndex(index: number): number {
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

	public seekToUid(targetUid: string): void {
		this.animations.fastEach((workingAnimations: AnimationObject[], i: number) => {
			workingAnimations.fastEach((workingAnimation: AnimationObject) => {
				const {
					uid,
				} = workingAnimation.items;

				if (uid !== targetUid) {
					return;
				}

				const frame = this.getTotalFramesBeforeIndex(i);

				this.onSeek(frame);
			});
		});
	}

	public seekTo(frame: number): void {
		this.onSeek(frame);
		this.onFrame(frame);
	}

	public onSeek(frame: number): void {
		this.onFrame(frame);
		// to be overriden
	}

	public hide(domElement: HTMLUnknownElement): $Object {
		return $(domElement).addClass('hidden');
	}

	public unhide(domElement: HTMLUnknownElement): $Object {
		return $(domElement).removeClass('hidden');
	}

	public activate(domElement: HTMLUnknownElement): $Object {
		return $(domElement).addClass('active');
	}

	public deactivate(domElement: HTMLUnknownElement): $Object {
		return $(domElement).removeClass('active');
	}
}
