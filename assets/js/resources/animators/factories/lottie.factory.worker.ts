// eslint-disable-next-line no-var
var lottie = lottie;
class LottieFactoryWorker {
	private canvas: OffscreenCanvas;
	private animation: any;

	constructor() {
		globalThis.onmessage = (event: MessageEvent): void => this.onMessage.call(this, event);
	}

	private async onMessage(event: MessageEvent): Promise<void> {
		if (!event.data) {
			return;
		}

		const {
			name = '',
		} = event.data;

		switch (name.toLowerCase()) {
		case 'create': {
			this.create(event)
				.then((result) => this.reply(result));
			break;
		}
		case 'prerender': {
			this.prerender(event)
				.then((result) => this.reply(result));
			break;
		}
		case 'play': {
			this.animation.play();
			break;
		}
		case 'ping': {
			this.reply({
				name: 'pong',
			});
			console.log('pong');
			break;
		}
		default:
		}
	}

	private async create(event: MessageEvent): Promise<Record<string, any>> {
		const animationData = JSON.parse(event.data.animationData);
		const {
			width: baseWidth,
			height: baseHeight,
		} = event.data.parameters;
		// const scale = (
		// 	width / height
		// 	> animationData.w / animationData.h
		// )
		// 	? height / animationData.h
		// 	: width / animationData.w;

		let width = null;
		let height = null;

		if (baseWidth / baseHeight
			> animationData.w / animationData.h) {
			width = baseWidth;
			height = baseWidth * (animationData.h / animationData.w);
		} else {
			width = baseHeight * (animationData.w / animationData.h);
			height = baseHeight;
		}

		this.canvas = new OffscreenCanvas(width, height);
		const context = this.canvas.getContext('2d');

		context.setTransform(
			1, // scale X
			0, // skew Y
			0, // skew X
			1, // scale Y
			0, // translate X
			0, // translate Y
		);

		console.log(width, height);

		this.animation = lottie.loadAnimation({
			loop: false,
			autoplay: false,
			...event.data,
			canvas: undefined,
			animationData,
			rendererSettings: {
				clearCanvas: true,
				...event.data.rendererSettings,
				context,
			},
			renderer: 'canvas',
		});

		return {
			name: 'create',
		};
	}

	private async prerender(event: MessageEvent): Promise<Record<string, any>> {
		const cache: ImageBitmap[] = [];

		for (let i = 0, l = event.data.parameters.until; i <= l; ++i) {
			this.animation.goToAndStop(i, true);
			cache[i] = this.canvas.transferToImageBitmap();
		}

		return {
			name: 'cache',
			cache,
		};
	}

	private reply(data: Record<string, any>): void {
		if (!data) {
			return;
		}

		console.log('reply:', data);
		(globalThis as unknown as Worker).postMessage(data);
	}
}

new LottieFactoryWorker();
