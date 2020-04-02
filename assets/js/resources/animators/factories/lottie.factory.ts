import { CoreAnimator } from '../../animators.js';
import {
	$,
	WindowUtility,
	PromiseQueueUtility,
} from '../../utilities.js';
import { lottie } from '../../../raw/libraries/lottie.js';
import {
	LottieObject,
	AnimationObject,
} from '../../animator.types.js';
import {
	upgradeElement,
} from '../../../raw/libraries/workerdom/main.js';
import { $Object } from '../../utilities/types/$.object.js';


export class LottieFactory {
	private mWindowUtility = new WindowUtility();
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
				dpr: animationObject.items.respectDevicePixelRatio === false
					? 1
					: this.ctx.dpr * this.ctx.dprMultiplier,
				preserveAspectRatio: 'xMidYMid slice',
				className: `${CoreAnimator.PREFIX} ${className} hidden`,
			},
		});

		await $(animation).on('DOMLoaded', () => new Promise((resolve) => resolve));

		const domContent = $(`.${CoreAnimator.PREFIX}.${className}`);
		const totalFrames = (
			animationObject.items.totalFrames
			|| animation.getDuration(true)
		);

		let isCacheAvailable = false;
		const canvasCtx = (domContent as unknown as HTMLCanvasElement).getContext('2d');
		let cache: OffscreenCanvas[] = null;
		this.prerender({
			animation,
			totalFrames,
			domContent,
			onFrame: null,
		}).then((result) => {
			console.log(result);

			cache = result.map((imageBitmap) => {
				const imageBitmapCanvas = new OffscreenCanvas(
					imageBitmap.width,
					imageBitmap.height,
				);

				imageBitmapCanvas
					.getContext('bitmaprenderer')
					.transferFromImageBitmap(imageBitmap);

				imageBitmap.close();

				return imageBitmapCanvas;
			});

			const windowWidth = this.mWindowUtility.viewport.width;
			const windowHeight = this.mWindowUtility.viewport.height;
			// const scale = Math.max(windowWidth, windowHeight) / Math.min(windowWidth, windowHeight);
			const offsetX = -((cache[0].width - windowWidth) / 2);
			const offsetY = -((cache[0].height - windowHeight) / 2);

			canvasCtx.setTransform(
				1, // scale X
				0, // skew Y
				0, // skew X
				1, // scale Y
				offsetX, // translate X
				offsetY, // translate Y
			);

			isCacheAvailable = true;
		});

		const onFrame = (animationItem: AnimationObject, frame: number): void => {
			if (isCacheAvailable) {
				canvasCtx.clearRect(0, 0, 99999, 99999);
				canvasCtx.drawImage(cache[Math.round(frame)], 0, 0);

				// console.log(cache[Math.round(frame)], Math.round(frame));
				return;
			}

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

	private async prerender(lottieObject: LottieObject): Promise<ImageBitmap[]> {
		return PromiseQueueUtility.enqueue(async () => {
			const mWorker = await upgradeElement(await this.getPlayground(), '/assets/js/raw/libraries/workerdom/worker/worker.js');

			mWorker.postMessage({
				name: 'create',
				animationData: JSON.stringify(lottieObject.animation.animationData),
				parameters: {
					width: this.mWindowUtility.viewport.width,
					height: this.mWindowUtility.viewport.height,
				},
			});

			await new Promise((resolve) => $(mWorker).on('message', (event) => event.data.name === 'create' && resolve()));

			mWorker.postMessage({
				name: 'prerender',
				parameters: {
					until: lottieObject.totalFrames,
				},
			});

			return new Promise((resolve) => $(mWorker).on('message', (event) => event.data.name === 'cache' && resolve(event.data.cache)));
		});
	}

	private async getPlayground(): Promise<$Object> {
		const $domContent = $('.painting > .playground');

		if ($domContent) {
			return $domContent;
		}

		const domContent = document.createElement('div');

		const lottieLibraryFileContent = (await (await fetch('/assets/js/raw/libraries/lottie.js')).text()).replace('export { lottie };', '');
		const lottieFactoryWorkerFileContent = await (await fetch('/assets/js/resources/animators/factories/lottie.factory.worker.js')).text();

		domContent.classList.add('playground');
		domContent.setAttribute('src', URL.createObjectURL(new Blob([lottieLibraryFileContent + lottieFactoryWorkerFileContent])));

		$('.painting').appendChild(domContent);

		return $(domContent);
	}
}
