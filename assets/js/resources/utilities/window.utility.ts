import { $ } from '../utilities.js';

export class WindowUtility {
	cache: {
		inner: {
			height: number;
			width: number;
		};
		viewport: {
			height: number;
			width: number;
		};
		client: {
			height: number;
			width: number;
		};
	};
	constructor() {
		this.resetCache();

		$(window).on('resize', () => {
			this.resetCache();
			this.cache = {
				inner: this.inner,
				viewport: this.viewport,
				client: this.client,
			};
		});
	}

	private resetCache(): void {
		this.cache = {
			inner: {
				height: null,
				width: null,
			},
			viewport: {
				height: null,
				width: null,
			},
			client: {
				height: null,
				width: null,
			},
		};
	}

	get client(): {
		height: number;
		width: number;
		} {
		if (this.cache.client.height
			|| this.cache.client.width) {
			return this.cache.client;
		}

		return {
			height: document.documentElement.clientHeight,
			width: document.documentElement.clientWidth,
		};
	}

	get inner(): {
		height: number;
		width: number;
		} {
		if (this.cache.inner.height
			|| this.cache.inner.width) {
			return this.cache.inner;
		}

		return {
			height: window.innerHeight,
			width: window.innerWidth,
		};
	}

	get viewport(): {
		height: number;
		width: number;
		} {
		if (this.cache.viewport.height
			|| this.cache.viewport.width) {
			return this.cache.viewport;
		}

		const viewportCalibrator = $('.__windowUtility.viewportCalibrator');
		const height = viewportCalibrator.offsetHeight;
		const width = viewportCalibrator.offsetWidth;

		return {
			height,
			width,
		};
	}
}
