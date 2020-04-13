import { $, $$, WindowUtility } from '../resources/utilities.js';
import Swiper from '../raw/libraries/swiper/swiper.js';
import { FrameAnimator } from '../resources/animators.js';
import { $Object } from '../resources/utilities.types.js';

export class TV {
	private swiper: Swiper = null;
	private screenDomSelector = '.screen';
	private screenDom = $(this.screenDomSelector);
	private clickFrameAnimator = new FrameAnimator();
	private currentOnClickDom: $Object = null;
	private mouseCatcherDom = $('.mouseCatcher');
	private mWindowUtility = new WindowUtility();

	private cachedMousePosition: {
		clientX: number;
		clientY: number;
	} = null;

	private mouseCatcherScaleResetTimeoutId: number = null;
	private mouseCatcherOverrideScale = false;

	public async create(): Promise<void> {
		$(window).on('load resize', () => this.onWindowResize.call(this));

		if (document.readyState === 'loading') {
			await new Promise((resolve) => $(window).on('load', resolve));
		}

		this.swiper = new Swiper(
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
				autoplay: {
					delay: 5000,
				},
				speed: 500,
				hashNavigation: {
					watchState: true,
				},
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

		$('.swiper-button-next').on('click', (event: MouseEvent) => this.onClick.call(this, event));
		$('.swiper-button-prev').on('click', (event: MouseEvent) => this.onClick.call(this, event));

		if (this.mWindowUtility.isMobile) {
			return;
		}

		this.mouseCatcherDom.removeClass('hidden');

		$(document).on('mousemove', (event: MouseEvent) => this.onMouseMove.call(this, event));

		$$('*').fastEach(
			(node: $Object) => node
				.on('mouseenter',
					(event: MouseEvent) => {
						if ($(event.target).css('cursor', { computed: true }) !== 'pointer') {
							this.mouseCatcherOverrideScale = false;

							return;
						}

						this.mouseCatcherOverrideScale = true;

						clearTimeout(this.mouseCatcherScaleResetTimeoutId);

						this.mouseCatcherDom.css({
							transform: 'scale(1)',
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

		this.mouseCatcherDom.css({
			left: clientX - 64,
			top: clientY - 64,
			transform: this.mouseCatcherOverrideScale ? '' : `scale(${
				Math.min(
					Math.max(
						Math.abs(clientX - cachedClientX),
						Math.abs(clientY - cachedClientY),
					) / 5,
					5,
				)})`,
		});

		this.cachedMousePosition = {
			clientX,
			clientY,
		};

		clearTimeout(this.mouseCatcherScaleResetTimeoutId);

		this.mouseCatcherScaleResetTimeoutId = !this.mouseCatcherOverrideScale && setTimeout(() => {
			this.mouseCatcherDom.css({
				transform: 'scale(0.1)',
			});
		}, 500);
	}

	private onClick(event: MouseEvent): void {
		const {
			currentTarget,
		} = event;

		this.currentOnClickDom = $(currentTarget);

		this.clickFrameAnimator.animate(0, 30);
	}
}
