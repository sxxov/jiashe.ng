import { CoreAnimator } from './core.animator.js';

export class FrameAnimator extends CoreAnimator {
	public async animate(
		from: number,
		to: number,
		options = {},
	): Promise<void> {
		return this.rawAnimate({
			from,
			to,
			options,
		}, (frame) => {
			super.onFrame(frame);
		});
	}

	public async repeat(
		from: number,
		to: number,
		options = {},
	): Promise<void> {
		for (;;) {
			await this.animate(from, to, options);
		}
	}

	public cancelNextFrame(): void {
		cancelAnimationFrame(this.rafId);
	}
}
