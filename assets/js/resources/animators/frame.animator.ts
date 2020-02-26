import { CoreAnimator } from './core.animator.js';

export class FrameAnimator extends CoreAnimator {
	async animate(
		from: number,
		to: number,
		options = {},
	): Promise<void> {
		return this.rawAnimate({
			from,
			to,
			options,
		}, (frame) => {
			this.onFrame(frame);
		});
	}

	async repeat(
		from: number,
		to: number,
		options = {},
	): Promise<void> {
		for (;;) {
			await this.animate(from, to, options);
		}
	}
}
