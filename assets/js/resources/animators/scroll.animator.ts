import { CoreAnimator } from './core.animator.js';
import { $ } from '../utilities.js';
import { AnimationObject } from '../animator.types.js';

export class ScrollAnimator extends CoreAnimator {
	constructor() {
		super();

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

	onScroll(): void {
		const { scrollY } = window;
		const globalFrame = this.getRelativeFrame(
			scrollY / (document.body.scrollHeight - this.mWindowUtility.viewport.height),
		);

		this.onFrame(globalFrame);
	}
}
