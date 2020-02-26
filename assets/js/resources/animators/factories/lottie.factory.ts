import { CoreAnimator } from '../../animators.js';
import { $ } from '../../utilities.js';
import { $Object } from '../../utilities.types.js';
import {
	LottieObject,
	AnimationObject,
} from '../../animator.types.js';

export class LottieFactory {
	private ctx: CoreAnimator;

	public constructor(thisArg: CoreAnimator) {
		this.ctx = thisArg;
	}

	public async create(animationObject: AnimationObject): Promise<LottieObject> {
		const className = animationObject.items.uid;
		const animation = this.ctx.lottie.loadAnimation({
			container: this.createAndReturnNewContainerDom(animationObject),
			renderer: 'canvas',
			loop: true,
			autoplay: true,
			animationData: animationObject.data,
			rendererSettings: {
				dpr: animationObject.items.respectDevicePixelRatio === false
					? 1
					: this.ctx.dpr * this.ctx.dprMultiplier,
				preserveAspectRatio: 'xMidYMid slice',
				className: `${this.ctx.animatorClassPrefix} ${className} hidden`,
			},
		});
		const totalFrames = (
			animationObject.items.totalFrames
			|| animation.getDuration(true)
		);
		const onFrame = (animationItem: AnimationObject, frame: number): void => {
			animationItem
				.items
				.lottieObject
				.animation
				.goToAndStop(
					frame,
					true,
				);
		};

		const lottieObject: LottieObject = {
			className,
			animation,
			totalFrames,
			onFrame,
		};

		lottieObject.animation.goToAndStop(-1, true);

		await $(lottieObject.animation).on('DOMLoaded', () => new Promise((resolve) => resolve));

		this.onLottieObjectCreated(lottieObject);

		return lottieObject;
	}

	private onLottieObjectCreated(lottieObject: LottieObject): void {
		const lottieObjectDom = $(`.${lottieObject.className}`);

		lottieObjectDom.css({
			width: '',
			height: '',
			position: 'fixed',
		});

		(lottieObjectDom as unknown as HTMLCanvasElement).width = 1;
		(lottieObjectDom as unknown as HTMLCanvasElement).height = 1;
	}

	private createAndReturnNewContainerDom(animationObject: AnimationObject): $Object {
		const animatorContainer = $(document.createElement('div'));

		animatorContainer.addClass([
			this.ctx.animatorClassPrefix,
			'container',
			this.ctx.uid,
			'height',
		]);

		if (animationObject
			.items
			.invert === true) {
			animatorContainer.addClass('invert');
		}

		this.ctx.activate(animatorContainer);

		this.ctx.animatorContainersWrapper.appendChild(animatorContainer);

		this.ctx.animatorContainers.push(animatorContainer);

		return animatorContainer;
	}
}
