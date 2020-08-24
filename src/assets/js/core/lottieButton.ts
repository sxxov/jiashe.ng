// eslint-disable-next-line import/named
import { $Object } from '../resources/utilities.types';
import { WindowUtility } from '../resources/utilities';

export class LottieButton {
	private mWindowUtility = new WindowUtility();

	create(options: {
		domContent: $Object;
		dpr: number;
		intent: string | (() => void);
		resolutionMultiplier: number;
	}): void {
		const {
			domContent,
			dpr,
			intent,
			resolutionMultiplier,
		} = options;

		const resolutionModifier = dpr * resolutionMultiplier;
		let isClickable = false;

		domContent
			.on(
				'mousemove touchmove',
				(event: MouseEvent) => {
					const {
						clientX,
						clientY,
					} = event;

					if (!clientX
					|| !clientY) {
						return;
					}

					const canvas = (domContent as unknown as HTMLCanvasElement);
					const canvasCtx = canvas.getContext('2d');
					const innerCenterOffset = domContent
						.parentElement // container div
						.parentElement // containersWrapper div
						.classList
						.contains('innerCenter')
						? 24
						: 0;
					const x = (
						(
							(
								(
									(
										clientX
								* resolutionModifier
									)
							- (
								canvas.width
								/ 2
							)
								)
						/ dpr
							)
					+ (
						canvas.width
						/ 2
					)
						)
					);
					const y = (
						(
							(
								(
									(
										clientY
								* resolutionModifier
									)
							- (
								canvas.height
								/ 2
							)
								)
						/ dpr
							)
					+ (
						canvas.height
						/ 2
					)
						)
				+ innerCenterOffset
					);

					const rgba = canvasCtx
						.getImageData(
							x - 10,
							y - 10,
							20,
							20,
						)
						.data;

					if (rgba.some((value) => value > 0)) {
						isClickable = true;

						if (!WindowUtility.isMobile) {
							domContent.css({
								filter: 'brightness(0.5)',
								cursor: 'pointer',
							});
						}

						return;
					}

					isClickable = false;
					domContent.css({
						filter: 'brightness(1)',
						cursor: '',
					});
				},
				{ passive: true },
			);

		// enable overriding intent of this button on other html files (bodge on bodge, kill me)
		domContent.on('click', () => isClickable && (
			typeof intent !== 'string'
				? intent()
				: window.open(intent ?? 'mailto:_@jiashe.ng')
		));
	}
}
