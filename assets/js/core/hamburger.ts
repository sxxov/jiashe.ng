import { lottie } from '../resources/lottie.js';
import {
	$,
	WindowUtility,
} from '../resources/utilities.js';
import { $Object } from '../resources/utilities.types.js';

export class Hamburger {
	public data: Record<string | number, any>;
	public lottieAnim: any;
	public playDirection: number;
	public containerDom: $Object;
	private mWindowUtility: WindowUtility;
	private skinDom: $Object;
	private organsDom: $Object;
	transitionValue: string;

	public constructor() {
		this.lottieAnim = null;
		this.playDirection = -1;
		this.containerDom = $('.hamburgerContainer');
		this.organsDom = $('.organs');
		this.skinDom = $('.skin');
		this.mWindowUtility = new WindowUtility();

		$(window).on('resize', () => window.requestAnimationFrame(() => this.onWindowResize.call(this)));
	}

	public async create(data: any): Promise<void> {
		this.data = data;

		this.containerDom.on('click', () => {
			this.onClick.call(this);
		});

		this.addLottie();
		this.animate();
	}

	private addLottie(): void {
		this.lottieAnim = lottie.loadAnimation({
			container: this.containerDom,
			renderer: 'canvas',
			autoplay: false,
			animationData: this.data,
			rendererSettings: {
				preserveAspectRatio: 'xMidYMin meet',
				className: 'hamburger',
			},
		});
	}

	public get isOpen(): boolean {
		return this.playDirection === -1;
	}

	public async getLottieData(): Promise<Record<string | number, any>> {
		return $().getJSON('/assets/js/raw/lottie/hamburger.json');
	}

	private onClick(): void {
		this.playDirection *= -1;
		this.lottieAnim.setDirection(this.playDirection);
		this.lottieAnim.play();

		this.animate();
	}

	private animate(): void {
		const windowHeight = Math.min(
			this.mWindowUtility.viewport.height,
			this.mWindowUtility.inner.height,
		);
		const windowWidth = Math.min(
			this.mWindowUtility.viewport.width,
			this.mWindowUtility.inner.width,
		);

		const height = 1;
		const width = 0;
		const top = (windowHeight - height) / 2;
		const left = (windowWidth - width) / 2;

		if (this.isOpen) {
			this.skinDom.css({
				height: '',
				width: '',
				top: 0,
				left: 0,
			});

			this.organsDom.css({
				height: '',
				width: '',
				top: 0,
				left: 0,
			});

			$(document.body).css({
				overflow: '',
			});
			return;
		}

		this.skinDom.css({
			height,
			width,
			top,
			left,
		});

		this.organsDom.css({
			height: height + top,
			width: width + left,
			top: -top,
			left: -left,
		});

		$(document.body).css({
			overflow: 'hidden',
		});
	}

	private onWindowResize(): void {
		this.animate();
	}
}
