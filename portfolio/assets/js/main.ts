import { MarkedNamespace } from './raw/libraries/marked/types/marked.js';
import { $, BezierUtility } from '../../../assets/js/resources/utilities.js';

const { marked }: { marked: MarkedNamespace['marked'] } = window as any;

class Main {
	private skinDom = $('.skin');

	private expectedScrollLeft: number;
	private cachedScrollLeft: number;
	private scrollRafId: number = null;

	private mBezierUtility = new BezierUtility(0.075, 0.82, 0.165, 1);

	public async create(): Promise<void> {
		this.skinDom.innerHTML = marked(await (await fetch(this.uri)).text());
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
