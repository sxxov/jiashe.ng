import {
	$,
	WindowUtility,
} from '../resources/utilities.js';

export class TV {
	private mWindowUtility = new WindowUtility();
	public videoId = 'vwKtPoE6Ppg';
	private screenElementId = 'screen';
	private screenElementSelector = `#${this.screenElementId}`;
	private tvElementSelector = '.tv';
	private playerVars: YT.PlayerVars = {
		loop: YT.Loop.Loop,
		autoplay: YT.AutoPlay.AutoPlay,
		autohide: YT.AutoHide.HideAllControls,
		modestbranding: YT.ModestBranding.Modest,
		rel: YT.RelatedVideos.Hide,
		showinfo: YT.ShowInfo.Hide,
		controls: YT.Controls.Hide,
		disablekb: YT.KeyboardControls.Disable,
		enablejsapi: YT.JsApi.Enable,
	};

	async init(): Promise<void> {
		if (navigator.onLine === false) {
			return;
		}

		await this.loadApi();

		const ctx = this;

		new Promise((resolve) => {
			new YT.Player(this.screenElementId, {
				events: {
					onReady(event: YT.PlayerEvent): void {
						ctx.onPlayerReady.call(ctx, event);
						resolve();
					},
					onStateChange(event: YT.OnStateChangeEvent): void {
						ctx.onPlayerStateChange.call(ctx, event);
					},
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
			screenDom.removeClass('innerCenter');
			tvDom.removeClass('innerCenter');
		} else {
			screenDom.addClass('innerCenter');
			tvDom.addClass('innerCenter');
		}
	}

	onPlayerStateChange(event: YT.OnStateChangeEvent): void {
		switch (event.data) {
		case YT.PlayerState.PLAYING:
			$(this.screenElementSelector).addClass('active');
			return;
		case YT.PlayerState.ENDED:
			$(this.screenElementSelector).css({
				display: 'none',
			});
			event.target.loadVideoById(this.videoId);
			$(this.screenElementSelector).css({
				display: '',
			});
			return;
		default:
			$(this.screenElementSelector).removeClass('active');
		}
	}

	onPlayerReady(event: YT.PlayerEvent): void {
		const {
			target,
		} = event;

		target.loadVideoById(this.videoId);
		target.mute();
	}

	loadApi(): Promise<void> {
		return new Promise((resolve) => {
			(window as any).onYouTubePlayerAPIReady = resolve;

			const tag = document.createElement('script');

			tag.src = 'https://www.youtube.com/iframe_api';
			const firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		});
	}
}
