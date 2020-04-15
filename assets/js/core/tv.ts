import { $, $$, WindowUtility } from '../resources/utilities.js';
import Swiper from '../raw/libraries/swiper/swiper.js';
import { FrameAnimator } from '../resources/animators.js';
import { $Object } from '../resources/utilities.types.js';
import { QueryDocumentSnapshot } from '../raw/libraries/firebase/types/firestore.js';
import { Placeholderer } from './placeholderer.js';

export class TV {
	private swiper: Swiper = null;
	private screenDomSelector = '.screen';
	private screenDom = $(this.screenDomSelector);
	private clickFrameAnimator = new FrameAnimator();
	private currentOnClickDom: $Object = null;
	private mouseCatcherDom = $('.mouseCatcher');
	private mWindowUtility = new WindowUtility();
	private mPlaceholderer = new Placeholderer();

	private cachedMousePosition: {
		clientX: number;
		clientY: number;
	} = null;

	private mouseCatcherScaleResetTimeoutId: number = null;
	private mouseCatcherOverrideScale = false;

	private splashDoms: $Object[] = [];

	public async create(docs: QueryDocumentSnapshot[]): Promise<void> {
		$(window).on('resize', () => this.onWindowResize.call(this));
		this.onWindowResize();

		if (document.readyState === 'loading') {
			await new Promise((resolve) => $(window).on('load', resolve));
		}

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

		$('.swiper-button-next').on('click', (event: MouseEvent) => this.onClick.call(this, event));
		$('.swiper-button-prev').on('click', (event: MouseEvent) => this.onClick.call(this, event));

		await this.createChannels(docs);

		this.swiper = this.createSwiper();

		if (this.mWindowUtility.isMobile) {
			return;
		}

		this.createMouseChaser();
		this.createSplash();

		$(document).on('mousemove', (event: MouseEvent) => this.onMouseMove.call(this, event));
	}

	private async createChannels(docs: QueryDocumentSnapshot[]): Promise<void> {
		await docs.forAwait(async (doc: QueryDocumentSnapshot, i) => {
			const {
				date,
				title,
				subtitle,
				images,
				description,
			} = doc.data();

			const wrapperDom = $('.swiper-wrapper');

			const containerDom = $(document.createElement('div'));
			containerDom.addClass([
				'swiper-slide',
				'channel',
				'container',
			]);
			containerDom.setAttribute('data-swiper-slide-index', i.toString());
			containerDom.setAttribute('data-hash', title.replace(/\s/g, '_'));

			const imageDom = $(document.createElement('img'));
			imageDom.addClass([
				'channel',
				'splash',
			]);
			[(imageDom as unknown as HTMLImageElement).src] = images;

			const titleDom = $(document.createElement('h1'));
			titleDom.addClass([
				'channel',
				'title',
				'white',
			]);
			titleDom.textContent = title;

			const subtitleDom = $(document.createElement('p'));
			subtitleDom.addClass([
				'channel',
				'subtitle',
				'white',
			]);
			subtitleDom.textContent = subtitle;

			wrapperDom.appendChild(containerDom);
			containerDom.appendChild(imageDom);
			containerDom.appendChild(titleDom);
			containerDom.appendChild(subtitleDom);

			await new Promise((resolve) => imageDom.on('load', resolve));

			// activate the container after 100ms for the animation to kick in
			setTimeout(() => this.screenDom.addClass('active'), 100);
		});

		$('.pace > .pace-activity').addClass('deactivated');
	}

	private createSplash(): void {
		this.splashDoms = $$('.channel.container > .splash');
	}

	private createSwiper(): Swiper {
		return new Swiper(
			this.screenDomSelector,
			{
				pagination: {
					el: '.swiper-pagination',
					clickable: true,
				},
				navigation: {
					nextEl: '.swiper-button-next',
					prevEl: '.swiper-button-prev',
				},
				loop: true,
				// if the page was refered with a #, disable autoplay
				autoplay: !window.location.href.includes('#') && {
					delay: 5000,
				},
				speed: 500,
				hashNavigation: {
					watchState: true,
				},
			},
		);
	}

	private createMouseChaser(): void {
		this.mouseCatcherDom.removeClass('hidden');

		$$('*').fastEach(
			(node) => node
				.on('mouseenter',
					(event: MouseEvent) => {
						if ($(event.target).css('cursor', { computed: true }) !== 'pointer') {
							this.mouseCatcherOverrideScale = false;

							return;
						}

						this.mouseCatcherOverrideScale = true;

						clearTimeout(this.mouseCatcherScaleResetTimeoutId);

						const magic = 256;

						this.mouseCatcherDom.css({
							margin: `${-magic / 2}px 0px 0px ${-magic / 2}px`,
							height: magic,
							width: magic,
						});
					}),
		);
	}

	private onWindowResize(): void {
		const viewportHeight = this.mWindowUtility.viewport.height;
		const innerHeight = this.mWindowUtility.inner.height;

		if (viewportHeight === innerHeight) {
			this.screenDom.removeClass('innerCenter');
		} else {
			this.screenDom.addClass('innerCenter');
		}
	}

	private onMouseMove(event: MouseEvent): void {
		const {
			clientX,
			clientY,
		} = event;

		if (this.cachedMousePosition === null) {
			this.cachedMousePosition = {
				clientX,
				clientY,
			};
		}

		const {
			clientX: cachedClientX,
			clientY: cachedClientY,
		} = this.cachedMousePosition;

		const unit = 128;
		const differenceX = Math.abs(clientX - cachedClientX);
		const differenceY = Math.abs(clientY - cachedClientY);
		const scaleFactor = 30;

		const magic = Math.max(
			Math.min(
				Math.max(
					differenceX,
					differenceY,
				) * scaleFactor,
				unit * 3,
			),
			unit / 2,
		);

		if (!this.mouseCatcherOverrideScale) {
			this.mouseCatcherDom.css({
				left: clientX,
				top: clientY,
				margin: `${-magic / 2}px 0px 0px ${-magic / 2}px`,
				height: magic,
				width: magic,
			});
		}

		this.cachedMousePosition = {
			clientX,
			clientY,
		};

		clearTimeout(this.mouseCatcherScaleResetTimeoutId);

		this.mouseCatcherScaleResetTimeoutId = !this.mouseCatcherOverrideScale && setTimeout(() => {
			this.mouseCatcherDom.css({
				margin: `${-unit / 4}px 0px 0px ${-unit / 4}px`,
				height: unit / 2,
				width: unit / 2,
			});
		}, 500);

		this.splashDoms.fastEach((splashDom) => {
			splashDom.css({
				transform: `translate(${(clientX - this.mWindowUtility.vw(50)) / 10}px, ${(clientY - this.mWindowUtility.vh(50)) / 10}px)`,
			});
		});
	}

	private onClick(event: MouseEvent): void {
		const {
			currentTarget,
		} = event;

		this.currentOnClickDom = $(currentTarget);

		this.clickFrameAnimator.animate(0, 30);
	}
}
