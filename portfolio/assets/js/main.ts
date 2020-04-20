import { MarkedNamespace } from './raw/libraries/marked/types/marked.js';
import { $, $$, BezierUtility } from '../../../assets/js/resources/utilities.js';
import { FrameAnimator } from '../../../assets/js/resources/animators.js';
import { $Object } from '../../../assets/js/resources/utilities.types.js';

const {
	marked,
	Darkmode,
}: {
	marked: MarkedNamespace['marked'];
	Darkmode: any;
} = window as any;

class Main {
	private skinDom = $('.skin');

	private expectedScrollLeft: number = window.scrollX;
	private cachedScrollLeft: number = null;
	private scrollRafId: number = null;

	private preventScrollEvent = false;
	private cachedScroll: {
		x: number;
		y: number;
	} = {
		x: 0,
		y: 0,
	};

	private clickFrameAnimator = new FrameAnimator();
	private currentOnClickDom: $Object = null;

	private mBezierUtility = new BezierUtility(0.075, 0.82, 0.165, 1);

	private darkMode = new Darkmode();

	public async create(): Promise<void> {
		this.skinDom.innerHTML = marked(await (await fetch(this.uri)).text());

		$(document.scrollingElement || document.documentElement)
			.on(
				'wheel',
				(event: MouseWheelEvent) => this.onVerticalScroll.call(this, event),
			);

		$(window)
			.on(
				'scroll',
				() => {
					this.onScroll.call(this);

					if (this.preventScrollEvent) {
						return;
					}

					this.expectedScrollLeft = window.scrollX;
				},
			);

		this.clickFrameAnimator.add({
			index: 0,
			type: 'null',
			items: {
				totalFrames: 30,
				onFrame: (animation, frame): void => {
					const domContent = this.currentOnClickDom;
					const {
						totalFrames,
					} = animation.items;

					domContent.css({
						opacity: Math.ceil((totalFrames - frame) / 3) % 4 ? 0 : 1,
					});
				},
			},
		});

		$('.header.container.logo').on('click', async (event: MouseEvent) => {
			await this.onClick(event);

			window.location.href = '/';
		});

		$('.header.container.night').on('click', async (event: MouseEvent) => {
			this.onClick(event);

			this.darkMode.toggle();
		});
	}

	private get uri(): string {
		let uri = String(window.location.href);

		uri = uri.substr(uri.indexOf('#') + 1);
		uri += uri.substr(-3) === '.md' ? '' : '.md';
		uri = `/assets/md/${uri}`;

		return uri;
	}

	private async onClick(event: MouseEvent): Promise<void> {
		this.currentOnClickDom = $(event.currentTarget);

		await this.clickFrameAnimator.animate(0, 30);
	}

	private onScroll(): void {
		const {
			scrollY,
			scrollX,
		} = window;

		const {
			x,
			y,
		} = this.cachedScroll;

		this.cachedScroll = {
			x: scrollX,
			y: scrollY,
		};

		if (scrollX - x > 0
			|| scrollY - y > 0) {
			$$('.header.container.logo, .header.container.night').fastEach((node) => node.removeClass('active'));

			return;
		}

		$$('.header.container.logo, .header.container.night').fastEach((node) => node.addClass('active'));
	}

	public onVerticalScroll(event: MouseWheelEvent): void {
		if (!event.deltaY) {
			return;
		}

		const delta = event.deltaY + event.deltaX;

		cancelAnimationFrame(this.scrollRafId);

		const currentTarget = $(event.currentTarget);

		currentTarget.scrollLeft = this.expectedScrollLeft;

		if (currentTarget.scrollLeft !== this.expectedScrollLeft) {
			this.expectedScrollLeft = Number(currentTarget.scrollLeft);
			this.preventScrollEvent = false;

			return;
		}

		this.cachedScrollLeft = this.expectedScrollLeft;
		this.expectedScrollLeft += delta;

		let i = 0;
		const handler = (): void => {
			const magic = this.mBezierUtility.getValue(
				(
					Math.abs(i)
				)
				/ Math.abs(delta),
			) * delta;


			this.preventScrollEvent = true;

			switch (true) {
			case delta < 0: {
				if (i < delta) {
					this.preventScrollEvent = false;

					return;
				}

				i -= 2;
				break;
			}
			case delta > 0: {
				if (i > delta) {
					this.preventScrollEvent = false;

					return;
				}

				i += 2;
				break;
			}
			default: {
				return;
			}
			}

			currentTarget.scrollLeft = magic + this.cachedScrollLeft;

			this.scrollRafId = requestAnimationFrame(() => handler());
		};
		this.scrollRafId = requestAnimationFrame(() => handler());
	}
}

(async (): Promise<void> => {
	(new Main()).create();
})();
