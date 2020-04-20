import { MarkedNamespace } from '../raw/libraries/marked/types/marked.js';
import { $, WindowUtility, BezierUtility } from '../resources/utilities.js';
import { $Object } from '../resources/utilities.types.js';

const { marked }: { marked: MarkedNamespace['marked'] } = window as any;

export class Book {
	public domContent: $Object = null;
	private scrollAmount: number = null;

	private mWindowUtility = new WindowUtility();
	private mBezierUtility = new BezierUtility(0.075, 0.82, 0.165, 1);

	private cachedScrollLeft = 0;
	private scrollRafId: number = null;
	private expectedScrollLeft = 0;

	private cachedBodyDomHeight: number = null;

	public isOpen = false;

	public async create(url: string, container: string | $Object): Promise<$Object> {
		if (this.domContent) {
			throw new Error('Book has already been created');
		}

		const bookContainerWrapperDom = $(document.createElement('div'));
		bookContainerWrapperDom.addClass([
			'book',
			'containerWrapper',
		]);

		const bookContainerDom = $(document.createElement('div'));
		bookContainerDom.addClass([
			'book',
			'container',
		]);
		bookContainerDom.innerHTML = marked(
			await (
				await fetch(
					url.substr(
						url.indexOf('jiashe.ng') + 9,
					),
				)
			).text(),
		);

		$(container).insertBefore(bookContainerWrapperDom, $(container).firstChild);
		bookContainerWrapperDom.appendChild(bookContainerDom);

		const bookContainerHeight = Math.ceil(
			parseFloat(
				bookContainerDom.css(
					'height',
					{ computed: true },
				) as string,
			)
			+ parseFloat(
				bookContainerDom.css(
					'padding',
					{ computed: true },
				) as string,
			) * 2,
		);
		bookContainerDom.css({
			columns: Math.ceil(bookContainerHeight / this.mWindowUtility.viewport.height),
			width: bookContainerHeight,
			height: '100%',
		});

		this.scrollAmount = bookContainerHeight;
		this.domContent = bookContainerWrapperDom;

		if (!(window as any).horizontalScrollingEnabled) {
			$(document.scrollingElement || document.documentElement)
				.addEventListener(
					'wheel',
					(event: MouseWheelEvent) => this.onVerticalScroll.call(this, event),
				);
			(window as any).horizontalScrollingEnabled = true;
		}

		return bookContainerWrapperDom;
	}

	public open(): void {
		if (this.isOpen) {
			return;
		}

		this.isOpen = true;

		this.domContent.css({
			transform: 'translateX(0px)',
			visibility: 'visible',
			width: this.scrollAmount,
		});

		$('.swiper-button-next').css({
			right: 'calc(0px - (var(--swiper-navigation-size)/ 44 * 27))',
		});

		$('.swiper-button-prev').css({
			left: 'calc(0px - (var(--swiper-navigation-size)/ 44 * 27))',
		});

		$('.swiper-pagination-bullets').css({
			bottom: -16,
		});

		$($('.__animate.scrollToContinue').parentElement).removeClass('active');

		this.cachedBodyDomHeight = parseInt($(document.body).css('height') as string, 10);

		$(document.body).css({
			overflowY: 'hidden',
			width: this.scrollAmount,
			height: '100%',
		});

		window.scrollTo({
			top: 0,
			left: 0,
			behavior: 'auto',
		});
	}

	public close(): void {
		if (!this.isOpen) {
			return;
		}

		this.isOpen = false;

		this.domContent.css({
			transform: 'translateX(-200vw)',
			visibility: 'visible',
		});

		$('.swiper-button-next').css({
			right: '',
		});

		$('.swiper-button-prev').css({
			left: '',
		});

		$('.swiper-pagination-bullets').css({
			bottom: '',
		});

		$($('.__animate.scrollToContinue').parentElement).addClass('active');

		$(document.body).css({
			overflowY: 'visible',
			width: '',
			height: this.cachedBodyDomHeight,
		});

		$(document.scrollingElement || document.documentElement)
			.removeEventListener(
				'wheel',
				(event: MouseWheelEvent) => this.onVerticalScroll.call(this, event),
			);
	}

	public onVerticalScroll(event: MouseWheelEvent): void {
		if (!event.deltaY) {
			return;
		}

		const delta = event.deltaY + event.deltaX;

		cancelAnimationFrame(this.scrollRafId);

		const currentTarget = this.domContent;


		$(currentTarget).css({
			transform: `translateX(${this.expectedScrollLeft}px)`,
		});

		if (parseFloat(($(currentTarget).css('transform') as string).replace('translateX(', '').replace('px)', '')) !== this.expectedScrollLeft) {
			this.expectedScrollLeft = Number((currentTarget as Element).scrollLeft);

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

			$(currentTarget).css({
				transform: `translateX(${magic + this.cachedScrollLeft}px)`,
			});

			this.scrollRafId = requestAnimationFrame(() => handler());
		};
		this.scrollRafId = requestAnimationFrame(() => handler());
	}
}
