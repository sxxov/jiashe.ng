import SmoothScroll from 'smoothscroll-for-websites';
import Darkmode from 'darkmode-js';
import { OhHiMark } from './core/ohHiMark.js';
import { $, $$ } from '../../../assets/js/resources/utilities.js';
import { FrameAnimator } from '../../../assets/js/resources/animators.js';
import { $Object } from '../../../assets/js/resources/utilities.types.js';

import '../css/main.css';

class Main {
	private skinDom = $('.skin');

	private cachedScroll: {
		x: number;
		y: number;
	} = {
		x: 0,
		y: 0,
	};

	private clickFrameAnimator = new FrameAnimator();
	private currentOnClickDom: $Object = null;

	private darkMode = new Darkmode();

	private isHorizontallyScrolling = null;

	public async create(): Promise<void> {
		this.skinDom.innerHTML = await OhHiMark.createFromUrl(this.uri);

		SmoothScroll({
			animationTime: 500,
			touchpadSupport: false,
			pulseScale: 6,
		});

		window.removeEventListener(SmoothScroll.wheelEvent, SmoothScroll.wheel);

		$(window)
			.on(
				SmoothScroll.wheelEvent,
				(event: MouseWheelEvent) => this.onVerticalScroll.call(this, event),
				{ passive: false },
			);

		$(window)
			.on(
				'scroll',
				() => {
					this.onScroll.call(this);
				},
			);

		$(window)
			.on(
				'load resize',
				() => this.onResize.call(this),
			);
		this.updateIsHorizontallyScrolling();

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

			const origin = this.getSLD(location.href);
			const referrerOrigin = this.getSLD(document.referrer);

			// if is on domain or access through an ip
			if (referrerOrigin !== origin) {
				window.location.href = '/'

				return;
			}

			window.history.back();
		});

		$('.header.container.night').on('click', async (event: MouseEvent) => {
			this.onClick(event);

			this.darkMode.toggle();
		});
	}

	private getSLD(string: string) {
		const withoutProtocol = string.substr(string.indexOf('//') + 2);
		
		return withoutProtocol.substr(0, withoutProtocol.indexOf('/'));
	}

	private get uri(): string {
		let uri = String(window.location.href);

		uri = uri.substr(uri.indexOf('#') + 1);
		uri = !uri.includes('_') ? uri : uri.replace(/_/g, '/');
		uri = !uri.includes('//') ? uri : uri.replace(/\/\//g, '_');
		uri += uri.substr(-3) === '.md' ? '' : '.md';
		uri = decodeURIComponent(uri);

		return uri;
	}

	private onResize(): void {
		this.updateIsHorizontallyScrolling();
	}

	private updateIsHorizontallyScrolling(): void {
		this.isHorizontallyScrolling = getComputedStyle(document.body).overflowY === 'hidden';
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
		const deltaY = -(event as any).wheelDeltaY;

		// invert deltas when the page is horizonal
		if (this.isHorizontallyScrolling) {
			// @dependent: 11052020/1, 11052020/2, 11052020/3
			SmoothScroll.wheel(
				event,
				deltaY,
				-0,
			);

			return;
		}

		// @dependent: 11052020/1, 11052020/2, 11052020/3
		SmoothScroll.wheel(
			event,
			-0,
			deltaY,
		);
	}
}

(async (): Promise<void> => {
	(new Main()).create();
})();
