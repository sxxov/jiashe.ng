import { $ } from './$.utility';

export class WindowUtility {
	private static cache: {
		inner?: {
			height: number;
			width: number;
		};
		viewport?: {
			height: number;
			width: number;
		};
		client?: {
			height: number;
			width: number;
		};
		isMobile?: boolean;
	} = {};

	public static invalidateCache(): void {
		this.cache = {};
	}

	public static refresh(): void {
		this.invalidateCache();

		this.cache = {
			inner: this.inner,
			viewport: this.viewport,
			client: this.client,
			isMobile: this.isMobile,
		};
	}

	public static vh(amount: number): number {
		return (this.viewport.height / 100) * amount;
	}

	public static vw(amount: number): number {
		return (this.viewport.width / 100) * amount;
	}

	public static px(amount: number): number {
		return amount * window.devicePixelRatio;
	}

	public static get client(): {
		height: number;
		width: number;
		} {
		if (this.cache?.client?.height
			|| this.cache?.client?.width) {
			return this.cache.client;
		}

		return {
			height: document.documentElement.clientHeight,
			width: document.documentElement.clientWidth,
		};
	}

	public static get inner(): {
		height: number;
		width: number;
		} {
		if (this.cache?.inner?.height
			|| this.cache?.inner?.width) {
			return this.cache.inner;
		}

		return {
			height: window.innerHeight,
			width: window.innerWidth,
		};
	}

	public static get viewport(): {
		height: number;
		width: number;
		} {
		if (this.cache?.viewport?.height
			|| this.cache?.viewport?.width) {
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

	public static get isMobile(): boolean {
		if (this.cache?.isMobile) {
			return this.cache.isMobile;
		}

		const isMobile = window.matchMedia('(pointer: coarse)').matches
			|| window.matchMedia('(pointer: cnone)').matches;

		this.cache.isMobile = isMobile;

		return isMobile;
	}
}

$(window).on('resize', () => WindowUtility.refresh());
