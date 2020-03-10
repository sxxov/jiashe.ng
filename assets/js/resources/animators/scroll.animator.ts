import { CoreAnimator } from './core.animator.js';
import { $ } from '../utilities.js';
import { AnimationObject } from '../animator.types.js';

export class ScrollAnimator extends CoreAnimator {
	private nextOnScrollCancelled: boolean;
	constructor() {
		super();

		this.nextOnScrollCancelled = false;
		$(window).on('scroll', () => window.requestAnimationFrame(() => this.onScroll.call(this)));
	}

	// @Override
	async add(animationToBeConstructed: AnimationObject): Promise<void> {
		await super.add(animationToBeConstructed);

		const windowHeight = this.mWindowUtility.viewport.height;
		const documentHeight = windowHeight * (this.animations.length + 1);

		$(document.body).css({
			height: documentHeight,
		});

		this.onScroll();
	}

	onSeek(frame: number): void {
		this.nextOnScrollCancelled = true;

		window.scrollTo(
			0,
			(frame / this.totalFrames)
			* (document.body.scrollHeight - this.mWindowUtility.viewport.height),
		);
	}

	onScroll(): void {
		if (this.nextOnScrollCancelled) {
			this.nextOnScrollCancelled = false;
			return;
		}

		const { scrollY } = window;
		const globalFrame = this.getRelativeFrame(
			scrollY / (document.body.scrollHeight - this.mWindowUtility.viewport.height),
		);

		this.onFrame(globalFrame);
	}
}
