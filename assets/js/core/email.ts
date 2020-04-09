import { $Object } from '../resources/utilities.types.js';

export class Email {
	get isMobile(): boolean {
		return window.matchMedia('(pointer: coarse)').matches
			|| window.matchMedia('(pointer: cnone)').matches;
	}

	create(options: {
		domContent: $Object;
		dpr: number;
		resolutionMultiplier: number;
	}): void {
		const {
			domContent,
			dpr,
			resolutionMultiplier,
		} = options;

		const resolutionModifier = dpr * resolutionMultiplier;
		let isClickable = false;

		domContent.on('mousemove touchmove', (event: MouseEvent) => {
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

				if (!this.isMobile) {
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
		});

		domContent.on('click', () => isClickable && window.open('mailto:_@jiashe.ng'));
	}
}
