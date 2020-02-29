import {
	$,
	WindowUtility,
} from '../resources/utilities.js';

export class TV {
	api: any;
	mWindowUtility: WindowUtility;
	videoId: string;
	screenElementId: string;
	screenElementSelector: string;
	tvElementSelector: string;
	playerVars: {
		loop: number;
		autoplay: number;
		autohide: number;
		modestbranding: number;
		rel: number;
		showinfo: number;
		controls: number;
		disablekb: number;
		enablejsapi: number;
	};

	constructor() {
		this.api = null;
		this.videoId = 'vwKtPoE6Ppg';
		this.screenElementId = 'screen';
		this.screenElementSelector = `#${this.screenElementId}`;
		this.tvElementSelector = '.tv';
		this.playerVars = {
			loop: 1,
			autoplay: 1,
			autohide: 1,
			modestbranding: 1,
			rel: 0,
			showinfo: 0,
			controls: 0,
			disablekb: 1,
			enablejsapi: 1,
		};

		this.mWindowUtility = new WindowUtility();
	}

	async init(): Promise<void> {
		if (navigator.onLine === false) {
			return;
		}

		await this.loadApi();

		new Promise((resolve) => {
			this.api = new (window as any).YT.Player(this.screenElementId, {
				events: {
					onReady: (event: Event): void => {
						this.onPlayerReady(event);
						resolve();
					},
					onStateChange: (event: Event): void => this.onPlayerStateChange.call(this, event),
				},
				playerVars: this.playerVars,
			});

			$(window).on('load resize', () => {
				this.onWindowResize();
			});
		});
	}

	onWindowResize(): void {
		const windowWidth = this.mWindowUtility.viewport.width;
		const windowHeight = this.mWindowUtility.viewport.height;

		let playerWidth = 0;
		let playerHeight = 0;
		let top = 0;
		let left = 0;

		// if the window is wider than 16:9 aspect ratio
		if ((windowWidth / windowHeight) > 16 / 9) {
			// have the height follow the width, crop the top and bottom
			playerWidth = windowWidth;
			playerHeight = windowWidth * (9 / 16);
		} else {
			// have the width follow the height, crop the sides
			playerWidth = windowHeight * (16 / 9);
			playerHeight = windowHeight;
		}

		// the values between the window and player
		const heightOffset = windowHeight - playerHeight;
		const widthOffset = windowWidth - playerWidth;

		// divide by 2 to center them
		top = heightOffset / 2;
		left = widthOffset / 2;

		const screenDom = $(this.screenElementSelector);
		const tvDom = $(this.tvElementSelector);

		// apply the 16 / 9 values onto the screen
		screenDom.css({
			width: playerWidth,
			height: playerHeight,
			top,
			left,
		});

		// apply the window dimensions to the tv
		tvDom.css({
			width: playerWidth + widthOffset / 2,
			height: playerHeight + heightOffset / 2,
			top,
			left,
		});

		const viewportHeight = this.mWindowUtility.viewport.height;
		const innerHeight = this.mWindowUtility.inner.height;

		if (viewportHeight === innerHeight) {
			screenDom.addClass('viewport');
			screenDom.removeClass('innerCenter');
			tvDom.addClass('viewport');
			tvDom.removeClass('innerCenter');
		} else {
			screenDom.addClass('innerCenter');
			screenDom.removeClass('viewport');
			tvDom.addClass('innerCenter');
			tvDom.removeClass('viewport');
		}
	}

	onPlayerStateChange(event: Event): void {
		// non-standard, used by youtube embed api
		switch ((event as any).data) {
		case (window as any).YT.PlayerState.PLAYING:
			$(this.screenElementSelector).addClass('active');
			return;
		case (window as any).YT.PlayerState.ENDED:
			$(this.screenElementSelector).css({
				display: 'none',
			});
			// non-standard, used by youtube embed api
			(event.target as any).loadVideoById(this.videoId);
			$(this.screenElementSelector).css({
				display: '',
			});
			return;
		default:
			$(this.screenElementSelector).removeClass('active');
		}
	}

	onPlayerReady(event: Event): void {
		const {
			target,
		} = event;

		// non-standard, used by youtube embed api
		(target as any).loadVideoById(this.videoId);
		(target as any).mute();
	}

	loadApi(): Promise<void> {
		return new Promise((resolve) => {
			// non-standard, used by youtube embed api
			(window as any).onYouTubePlayerAPIReady = resolve;

			const tag = document.createElement('script');

			tag.src = 'https://www.youtube.com/iframe_api';
			const firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		});
	}
}
