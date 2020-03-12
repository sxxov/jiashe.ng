import { lottie } from '../resources/lottie.js';
import {
	$,
	WindowUtility,
	$$,
} from '../resources/utilities.js';
import { $Object } from '../resources/utilities.types.js';
import { AnimationObject } from '../resources/animator.types.js';
import { FrameAnimator, CoreAnimator } from '../resources/animators.js';

export class Hamburger {
	public data: Record<string | number, any>;
	public lottieAnim: any;
	public playDirection: number;
	public headerHamburgerIconDom: $Object;
	public menuContainersWrapperDom: $Object;
	private mWindowUtility: WindowUtility;
	private skinDom: $Object;
	private organsDom: $Object;
	public hamburgerMenuClassPrefix: string;
	private titles: [{
		domContent: $Object;
		revealFrameAnimator: FrameAnimator;
		hoverFrameAnimator: FrameAnimator;
	}?];
	private ctx: CoreAnimator;
	private clickFrameAnimator: FrameAnimator;
	private currentOnClickDom: $Object;
	private cachedAnimationsLength: number;
	private currentOnMouseDom: $Object;

	public constructor(mCoreAnimator: CoreAnimator) {
		this.lottieAnim = null;
		this.playDirection = -1;
		this.headerHamburgerIconDom = $('.header.containersWrapper > .hamburger');
		this.menuContainersWrapperDom = $('.__hamburgerMenu.containersWrapper');
		this.hamburgerMenuClassPrefix = '__hamburgerMenu';
		this.organsDom = $('.organs');
		this.skinDom = $('.skin');
		this.mWindowUtility = new WindowUtility();
		this.titles = [];
		this.ctx = mCoreAnimator;
		this.clickFrameAnimator = new FrameAnimator();
		this.currentOnClickDom = null;
		this.cachedAnimationsLength = null;
		this.currentOnMouseDom = null;

		$(window).on('resize', () => window.requestAnimationFrame(() => this.onWindowResize.call(this)));
	}

	public async create(data: any): Promise<void> {
		this.data = data;

		this.clickFrameAnimator.add({
			index: 0,
			type: 'null',
			items: {
				totalFrames: 30,
				onFrame: (animation, frame): void => {
					const domContent = this.currentOnClickDom;

					domContent.css({
						opacity: Math.ceil((animation.items.totalFrames - frame) / 3) % 4 ? 1 : 0,
					});
				},
			},
		});

		this.headerHamburgerIconDom.on('click', (event: Event) => {
			this.menuContainersWrapperDom.removeClass('hidden');
			this.onClick.call(this, event);
		});

		this.menuContainersWrapperDom.addClass('hidden');

		const otherOnAdd = this.ctx.onAdd;
		this.ctx.onAdd = (animation): void => {
			otherOnAdd.call(this.ctx, animation);

			this.createHamburgerMenuItems();
		};

		this.createHamburgerMenuItems();
		this.createHamburgerToppings();

		this.addLottie();
	}

	private createHamburgerToppings(): void {
		$('.header.containersWrapper > .logo').on('click', (event: Event) => {
			this.ctx.seekTo(0);

			if (!this.isOpen) {
				this.currentOnClickDom = $(event.currentTarget);
				this.clickFrameAnimator.animate(0, 30);

				return;
			}

			this.onClick(event);
		});
	}

	private addLottie(): void {
		this.lottieAnim = lottie.loadAnimation({
			container: this.headerHamburgerIconDom,
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
		return this.playDirection === 1;
	}

	public async getLottieData(): Promise<Record<string | number, any>> {
		return $().getJSON('/assets/js/raw/lottie/hamburger.json');
	}

	private onClick(event: Event, options?: {
		newState?: 'closed' | 'opened';
	}): void {
		if (!options) {
			this.onClick(event, {});

			return;
		}

		const {
			newState,
		} = options;

		if ((
			newState === 'closed'
				&& !this.isOpen
		) || (
			newState === 'opened'
				&& this.isOpen
		)) {
			return;
		}

		if (this.isOpen) {
			this.animateCloseHamburger();
		} else {
			this.animateOpenHamburger();

			$$(`.${this.hamburgerMenuClassPrefix}.title`)
				.fastEach(
					(hamburgerMenuTitleDom: $Object) => this.animateTitleReveal(hamburgerMenuTitleDom),
				);
		}

		this.playDirection *= -1;
		this.lottieAnim.setDirection(this.playDirection);
		this.lottieAnim.play();

		this.currentOnClickDom = $(event.currentTarget);
		this.clickFrameAnimator.animate(0, 30);

		if (!this.currentOnMouseDom) {
			return;
		}

		this.animateTitleHover(this.currentOnMouseDom, 'out');
	}

	private onTitleMouseOver(event: Event): void {
		this.currentOnMouseDom = $(event.currentTarget);

		this.animateTitleHover($(event.currentTarget), 'over');
	}

	private onTitleMouseOut(event: Event): void {
		this.currentOnMouseDom = $(event.currentTarget);

		this.animateTitleHover($(event.currentTarget), 'out');
	}

	private animateOpenHamburger(): void {
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

	private animateCloseHamburger(): void {
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
	}

	private createHamburgerMenuItems(): void {
		if (this.cachedAnimationsLength === this.ctx.animations.length) {
			return;
		}

		// used to get value of variable instead of reference
		this.cachedAnimationsLength = Number(this.ctx.animations.length);

		// clear the insides to prevent duplicates
		this.menuContainersWrapperDom.innerHTML = '';

		// programatically generate css grid
		this.menuContainersWrapperDom.css({
			'grid-template-rows': `auto repeat(${this.ctx.animations.length}, min-content) auto`,
		});

		// append dom nodes and create animator instances for each first animation
		this.ctx.animations.fastEach((workingAnimations: AnimationObject[], i: number) => {
			const {
				uid,
			} = workingAnimations[0].items;

			const menuContainerDom = $(document.createElement('div'));
			menuContainerDom.addClass([this.hamburgerMenuClassPrefix, 'container', uid]);

			const titleDom = $(document.createElement('h1'));
			titleDom.addClass([this.hamburgerMenuClassPrefix, 'title', uid]);
			titleDom.textContent = uid;

			this.menuContainersWrapperDom.appendChild(menuContainerDom);
			menuContainerDom.appendChild(titleDom);
			menuContainerDom.css({
				'grid-row': `${i + 2} / ${i + 3}`,
				'grid-column': '2 / 3',
			});

			const revealFrameAnimator = new FrameAnimator();
			const hoverFrameAnimator = new FrameAnimator();

			this.titles.push({
				domContent: titleDom,
				revealFrameAnimator,
				hoverFrameAnimator,
			});

			const prefix = '.';
			const suffix = '';
			titleDom.innerHTML = titleDom
				.textContent
				.split('')
				.map((char: string) => `<span class="${titleDom.classList.value.replace('title', 'char')}">${char}</span>`)
				.join('');
			titleDom.innerHTML = `
				<span class="${titleDom.classList.value.replace('title', 'prefix')}">
					${prefix}
				</span>
				${titleDom.innerHTML}
				<span class="${titleDom.classList.value.replace('title', 'suffix')}">
					${suffix}
				</span>
			`.replace(/[\t\n\r]/g, '');

			const totalFrames = 120;

			titleDom.childNodes.forEach((node, index) => {
				// add reveal animations
				revealFrameAnimator.add({
					index: 0,
					type: 'null',
					items: {
						totalFrames: totalFrames + 60,
						offset: (index
								* ((totalFrames + 60) / titleDom.textContent.length)
						),
						bezier: [0.165, 0.84, 0.44, 1],
						onVisible: (): void => {
							const domContent = $(node);

							revealFrameAnimator.deactivate(domContent);
						},
						onFrame: (animation, frame): void => {
							const {
								totalFrames: animationTotalFrames,
							} = animation.items;

							const domContent = $(node);

							domContent.css({
								transform: `translateX(${(animationTotalFrames - frame) / 2}px)`,
							});
							revealFrameAnimator.activate(domContent);
						},
					},
				});

				revealFrameAnimator.add({
					index: -1,
					type: 'null',
				});

				// add hover animations
				hoverFrameAnimator.add({
					index: 0,
					type: 'null',
					items: {
						totalFrames,
						offset: index
							* ((totalFrames) / titleDom.textContent.length),
						bezier: [0.77, 0, 0.175, 1],
						onHidden: (): void => {
							const domContent = $(node);

							domContent.css({
								transform: 'translateY(0px)',
							});
						},
						onFrame: (animation, frame): void => {
							const domContent = $(node);

							if (/prefix/gi.test((node as Element).classList.value)) {
								return;
							}

							domContent.css({
								transform: `translateY(${index % 2 === 0 ? '' : '-'}${frame / 14}px)`,
							});
						},
					},
				});

				hoverFrameAnimator.add({
					index: -1,
					type: 'null',
				});
			});

			titleDom.on('click', (event: Event) => {
				this.ctx.seekToUid(uid);
				this.onClick(event, {
					newState: 'closed',
				});
			});
			titleDom.on('mouseover', (event: Event) => {
				this.onTitleMouseOver(event);
			});
			titleDom.on('mouseout mouseleave', (event: Event) => {
				this.onTitleMouseOut(event);
			});
		});
	}

	private animateTitleHover(titleDom: $Object, state: 'over'| 'out'): void {
		let titleIndex: number = this.titles.length;
		let totalFrames = null;

		this.titles.forEach(
			(title, index: number) => {
				if (title.domContent === titleDom) {
					titleIndex = index;
					totalFrames = title.hoverFrameAnimator.animations[0][0].items.totalFrames;
				}
			},
		);

		let end = null;

		switch (state) {
		case 'over':
			end = totalFrames;
			break;
		case 'out':
			end = 0;
			break;
		default:
			return;
		}

		const { hoverFrameAnimator } = this.titles[titleIndex];

		if (hoverFrameAnimator.currentFrame === end) {
			hoverFrameAnimator.animate(
				end - 1,
				end,
			);
			return;
		}

		hoverFrameAnimator.animate(
			hoverFrameAnimator.currentFrame,
			end,
		);
	}

	private animateTitleReveal(titleDom: $Object): void {
		let titleIndex: number = this.titles.length;
		let totalFrames = null;

		this.titles.forEach(
			(title, index: number) => {
				if (title.domContent === titleDom) {
					titleIndex = index;
					totalFrames = title.revealFrameAnimator.animations[0][0].items.totalFrames;
				}
			},
		);

		this.titles[titleIndex].revealFrameAnimator.animate(0, totalFrames);
	}

	private onWindowResize(): void {
		if (this.isOpen) {
			this.animateOpenHamburger();
			return;
		}

		this.animateCloseHamburger();
	}
}
