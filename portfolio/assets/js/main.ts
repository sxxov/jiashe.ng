import { MarkedNamespace } from './raw/libraries/marked/types/marked.js';
import { $, BezierUtility } from '../../../assets/js/resources/utilities.js';
import { FrameAnimator } from '../../../assets/js/resources/animators.js';
import { $Object } from '../../../assets/js/resources/utilities.types.js';

const { marked }: { marked: MarkedNamespace['marked'] } = window as any;

class Main {
	private skinDom = $('.skin');

	private expectedScrollLeft: number;
	private cachedScrollLeft: number;
	private scrollRafId: number = null;

	private clickFrameAnimator = new FrameAnimator();
	private currentOnClickDom: $Object = null;

	private mBezierUtility = new BezierUtility(0.075, 0.82, 0.165, 1);

	public async create(): Promise<void> {
		this.skinDom.innerHTML = marked(await (await fetch(this.uri)).text());

		$(document.scrollingElement || document.documentElement)
			.on(
				'wheel',
				(event: MouseWheelEvent) => this.onVerticalScroll.call(this, event),
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
			this.currentOnClickDom = $(event.currentTarget);

			await this.clickFrameAnimator.animate(0, 10);

			window.location.href = '/';
		});
	}

	private get uri(): string {
		let uri = String(window.location.href);

		uri = uri.substr(uri.indexOf('#') + 1);
		uri += uri.substr(-3) === '.md' ? '' : '.md';
		uri = `/assets/md/${uri}`;

		return uri;
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


			switch (true) {
			case delta < 0: {
				if (i < delta) {
					return;
				}

				i -= 2;
				break;
			}
			case delta > 0: {
				if (i > delta) {
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
