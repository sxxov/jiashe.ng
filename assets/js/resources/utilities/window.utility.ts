import { $ } from '../utilities.js';

export class WindowUtility {
	private cache: {
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
		isMobile: boolean;
	};

	constructor() {
		this.resetCache();

		$(window).on('resize', () => {
			this.resetCache();
			this.cache = {
				inner: this.inner,
				viewport: this.viewport,
				client: this.client,
				isMobile: this.isMobile,
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
			isMobile: null,
		};
	}

	public vh(amount: number): number {
		return (this.viewport.height / 100) * amount;
	}

	public vw(amount: number): number {
		return (this.viewport.width / 100) * amount;
	}

	public px(amount: number): number {
		return amount * window.devicePixelRatio;
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

	get isMobile(): boolean {
		if (this.cache.isMobile) {
			return this.cache.isMobile;
		}

		const isMobile = window.matchMedia('(pointer: coarse)').matches
			|| window.matchMedia('(pointer: cnone)').matches;

		this.cache.isMobile = isMobile;

		return isMobile;
	}
}
