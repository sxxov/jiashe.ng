import lottie from 'lottie-web';
import { CoreAnimator } from '../../animators.js';
import { AnimationObject } from '../types/animation.object';
import { LottieObject } from '../types/lottie.object.js';
import { $ } from '../../utilities/$.utility.js';

export class LottieFactory {
	private ctx: CoreAnimator;

	public constructor(thisArg: CoreAnimator) {
		this.ctx = thisArg;
	}

	public async create(animationObject: AnimationObject): Promise<LottieObject> {
		const className = animationObject.items.uid;
		const animation = lottie.loadAnimation({
			container: animationObject.items.__container,
			renderer: 'canvas',
			loop: true,
			autoplay: true,
			animationData: animationObject.data,
			rendererSettings: {
				// @ts-expect-error
				dpr: animationObject.items.respectDevicePixelRatio === false
					? 1
					: this.ctx.dpr * this.ctx.resolutionMultiplier,
				preserveAspectRatio: 'xMidYMid slice',
				className: `${CoreAnimator.PREFIX} ${className} hidden`,
			},
		});

		if (!animation) {
			await new Promise((resolve) => $(animation).on('DOMLoaded', () => resolve));
		}

		const domContent = $(`.${className}`);
		const totalFrames = (
			animationObject.items.totalFrames
			|| animation.getDuration(true)
		);
		const onFrame = (animationItem: AnimationObject, frame: number): void => {
			animationItem
				.items
				.object
				.lottie
				.animation
				.goToAndStop(
					frame,
					true,
				);
		};

		const lottieObject: LottieObject = {
			animation,
			totalFrames,
			domContent,
			onFrame,
		};

		lottieObject.animation.goToAndStop(-1, true);

		this.onLottieObjectCreated(lottieObject);

		return lottieObject;
	}

	private onLottieObjectCreated(lottieObject: LottieObject): void {
		const lottieObjectDom = lottieObject.domContent;

		lottieObjectDom.css({
			width: '',
			height: '',
			position: 'absolute',
		});

		(lottieObjectDom as unknown as HTMLCanvasElement).width = 1;
		(lottieObjectDom as unknown as HTMLCanvasElement).height = 1;
	}
}
