import { CoreAnimator } from './core.animator.js';
import { $ } from '../utilities.js';
import { AnimationObject } from '../animator.types.js';

export class ScrollAnimator extends CoreAnimator {
	private nextOnScrollCancelled = false;
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

	// @Override
	public onSeek(frame: number): void {
		const yOffset = Math.max(
			Math.ceil(
				(frame / this.totalFrames)
				* (document.body.scrollHeight - this.mWindowUtility.viewport.height),
			) - 7,
			0,
		);

		this.scrollTo({
			left: 0,
			top: yOffset,
			behavior: 'smooth',
		}, () => {
			this.onFrame(frame);
		});
	}

	// @Override
	public seekTo(scrollPosition: number): void {
		this.scrollTo({
			left: 0,
			top: scrollPosition,
			behavior: 'smooth',
		}, () => {
			this.onFrame(scrollPosition);
		});
	}

	private scrollTo(scrollOptions: {
		top?: number;
		left?: number;
		behavior?: 'smooth' | 'auto';
	}, callback?: () => void): void {
		const {
			top = 0,
			left = 0,
			behavior,
		} = scrollOptions;

		const onScroll = (): void => {
			// floor both values as some browsers support decimals while some don't
			if (Math.floor(window.pageYOffset) === Math.floor(top)
				&& Math.floor(window.pageXOffset) === Math.floor(left)) {
				this.nextOnScrollCancelled = true;

				window.removeEventListener('scroll', onScroll);

				if (!callback) {
					return;
				}

				callback();
			}
		};
		window.addEventListener('scroll', onScroll);
		onScroll();
		window.scrollTo({
			top,
			behavior,
		});
	}

	public onScroll(): void {
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
