import lottie from 'lottie-web';
import {
	$,
	WindowUtility,
	$$,
} from '../resources/utilities';
// eslint-disable-next-line import/named
import { $Object } from '../resources/utilities.types';
// eslint-disable-next-line import/named
import { AnimationObject } from '../resources/animator.types';
import { FrameAnimator, CoreAnimator } from '../resources/animators';

export class Hamburger {
	public static PREFIX = '__hamburgerMenu';

	private mWindowUtility = new WindowUtility();

	public lottieAnimationData: Record<string | number, any>;
	public lottieAnimation: any = null;
	public lottiePlayDirection = -1;

	public hamburgerIconDom = $('.header.containersWrapper > .hamburger');
	public hamburgerMenuContainersWrapperDom = $('.__hamburgerMenu.containersWrapper');

	private skinDom = $('.skin');
	private organsDom = $('.organs');

	private titles: [{
		domContent: $Object;
		revealFrameAnimator: FrameAnimator;
		hoverFrameAnimator: FrameAnimator;
	}?] = [];

	private ctx: CoreAnimator;

	private clickFrameAnimator = new FrameAnimator();

	private currentOnClickDom: $Object = null;
	private currentOnMouseDom: $Object = null;
	private currentOnMouseChildDom: $Object;

	private cachedAnimationsLength: number = null;

	public constructor(mCoreAnimator: CoreAnimator) {
		this.ctx = mCoreAnimator;

		$(window).on('resize', () => window.requestAnimationFrame(() => this.onWindowResize.call(this)));
	}

	public create(lottieAnimationData: unknown): void {
		this.lottieAnimationData = lottieAnimationData;

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

		this.hamburgerIconDom.on('click', (event: Event) => {
			this.hamburgerMenuContainersWrapperDom.removeClass('hidden');
			this.onClick.call(this, event);
		});

		this.hamburgerMenuContainersWrapperDom.addClass('hidden');

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
		this.lottieAnimation = lottie.loadAnimation({
			container: this.hamburgerIconDom,
			renderer: 'svg',
			autoplay: false,
			loop: false,
			animationData: this.lottieAnimationData,
			rendererSettings: {
				preserveAspectRatio: 'xMidYMin meet',
				className: 'hamburger',
			},
		});
	}

	public get isOpen(): boolean {
		return this.lottiePlayDirection === 1;
	}

	public async getLottieData(): Promise<Record<string | number, any>> {
		return $().getJSON('assets/js/raw/lottie/hamburger.json');
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

		const titles = $$(`.${Hamburger.PREFIX}.title`);

		if (this.isOpen) {
			this.animateCloseHamburger();

			titles.fastEach((hamburgerMenuTitleDom: $Object) => {
				hamburgerMenuTitleDom.css('pointer-events', 'none');

				this.animateTitleReveal(hamburgerMenuTitleDom, 'hide');
			});
		} else {
			if (this.currentOnMouseDom) {
				this.animateTitleHover(this.currentOnMouseDom, 'out');
			}

			this.animateOpenHamburger();

			titles.fastEach((hamburgerMenuTitleDom: $Object) => {
				hamburgerMenuTitleDom.css('pointer-events', 'auto');

				this.animateTitleReveal(hamburgerMenuTitleDom, 'reveal');
			});
		}

		this.lottiePlayDirection *= -1;
		this.lottieAnimation.setDirection(this.lottiePlayDirection);
		this.lottieAnimation.play();

		this.currentOnClickDom = $(event.currentTarget);
		this.clickFrameAnimator.animate(0, 30);
	}

	private onTitleMouseOver(event: Event): void {
		this.currentOnMouseDom = $(event.currentTarget);
		this.currentOnMouseChildDom = $(event.target);

		this.animateTitleHover($(event.currentTarget), 'over');
	}

	private onTitleMouseOut(event: Event): void {
		this.currentOnMouseDom = $(event.currentTarget);
		this.currentOnMouseChildDom = $(event.target);

		this.animateTitleHover($(event.currentTarget), 'out');
	}

	private animateOpenHamburger(): void {
		const windowHeight = Math.min(
			WindowUtility.viewport.height,
			WindowUtility.inner.height,
		);
		const windowWidth = Math.min(
			WindowUtility.viewport.width,
			WindowUtility.inner.width,
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
		this.hamburgerMenuContainersWrapperDom.innerHTML = '';

		// programatically generate css grid
		this.hamburgerMenuContainersWrapperDom.css({
			// add 1 if there's a pre animation (index of -1)
			'grid-template-rows': `auto repeat(${this.ctx.animations.length + Number(!!this.ctx.animations[-1])}, min-content) auto`,
		});

		// append dom nodes and create animator instances for each first animation
		const handler = (workingAnimations: AnimationObject[], i: number): void => {
			const {
				uid,
			} = workingAnimations[0].items;

			const menuContainerDom = $(document.createElement('div'));
			menuContainerDom.addClass([
				Hamburger.PREFIX,
				'container',
				uid,
			]);

			const titleDom = $(document.createElement('h1'));
			titleDom.addClass([
				Hamburger.PREFIX,
				'title',
				uid,
			]);
			// titleDom.textContent = uid;

			this.hamburgerMenuContainersWrapperDom.appendChild(menuContainerDom);

			let processedIndex = i;

			if (this.ctx.animations[-1]) {
				processedIndex += 1;
			}

			menuContainerDom.css({
				'grid-row': `${processedIndex + 2} / ${processedIndex + 3}`,
				'grid-column': '2 / 3',
			});

			const revealFrameAnimator = new FrameAnimator();
			const hoverFrameAnimator = new FrameAnimator();

			this.titles.push({
				domContent: titleDom,
				revealFrameAnimator,
				hoverFrameAnimator,
			});

			const suffix = '';
			const prefix = '——\xa0\xa0'; // prefix + &nbsp&nbsp;
			const textContent = uid;
			const { className } = titleDom;

			titleDom.textContent = '';

			// prefix
			const prefixSpanDom = document.createElement('span');

			prefixSpanDom.className = className.replace('title', 'prefix');
			prefixSpanDom.textContent = prefix;

			titleDom.appendChild(prefixSpanDom);

			// content
			textContent
				.split('')
				.fastEach((titleChar: string[1]) => {
					const spanDom = document.createElement('span');

					spanDom.className = `${className.replace('title', 'char')}`;
					spanDom.textContent = titleChar;

					titleDom.appendChild(spanDom);
				});

			// suffix
			const suffixSpanDom = document.createElement('span');

			suffixSpanDom.className = className.replace('title', 'suffix');
			suffixSpanDom.textContent = suffix; // prefix + &nbsp;

			titleDom.appendChild(suffixSpanDom);

			const totalFrames = 120;

			// add pre to enable onHidden
			revealFrameAnimator.add({
				index: -1,
				type: 'null',
			});

			// add pre to enable onHidden
			hoverFrameAnimator.add({
				index: -1,
				type: 'null',
			});

			// add container background reveal
			revealFrameAnimator.add({
				index: 0,
				type: 'null',
				items: {
					totalFrames,
					offset: -(totalFrames
						* ((i + 1) / (this.ctx.animations.length + 1))) / 4,
					bezier: [0.25, 1, 0.5, 1],
					onHidden: (): void => {
						const containerDomContent = $(titleDom.parentElement);

						containerDomContent.css({
							opacity: 0,
						});
					},
					onFrame: (animation, frame): void => {
						const {
							totalFrames: animationTotalFrames,
						} = animation.items;

						const containerDomContent = $(titleDom.parentElement);

						if (frame > 0) {
							containerDomContent.css({
								width: `${((frame) / animationTotalFrames) * 100}%`,
								opacity: 1,
							});

							return;
						}

						containerDomContent.css({
							width: `${((frame) / animationTotalFrames) * 100}%`,
							opacity: 0,
						});
					},
				},
			});

			titleDom.childNodes.forEach((node, index) => {
				// add reveal animations
				revealFrameAnimator.add({
					index: 0,
					type: 'null',
					items: {
						totalFrames,
						offset: -(totalFrames
								// prefix and suffix changes the length of textContent, so just get it from dom
								* ((titleDom.textContent.length - index) / titleDom.textContent.length)
						) / 4,
						bezier: [0.165, 0.84, 0.44, 1],
						onHidden: (): void => {
							const domContent = $(node);

							domContent.css({
								opacity: 0,
							});
						},
						onFrame: (animation, frame): void => {
							const {
								totalFrames: animationTotalFrames,
							} = animation.items;

							const domContent = $(node);

							domContent.css({
								transform: `translateX(-${(animationTotalFrames - frame) * 2}px)`,
								opacity: 1,
							});
						},
					},
				});

				// if the currently working item is not the prefix
				if (!(node as Element).classList.contains('prefix')) {
					// add hover animations
					hoverFrameAnimator.add({
						index: 0,
						type: 'null',
						items: {
							totalFrames,
							offset: -(totalFrames
								* ((index) / titleDom.textContent.length)),
							bezier: [0.25, 1, 0.5, 1],
							onHidden: (): void => {
								const domContent = $(node);

								domContent.css({
									transform: 'translateY(0px)',
								});
							},
							onFrame: (animation, frame): void => {
								const domContent = $(node);
								const {
									totalFrames: animationTotalFrames,
								} = animation.items;

								switch (true) {
								// if currently not hovering over prefix, remove 'forced'
								case !this.currentOnMouseChildDom.classList.contains('prefix'):
									domContent.removeClass('forced');
									break;
								case frame <= animationTotalFrames / 2:
									domContent.removeClass('forced');
									break;
								case frame > animationTotalFrames / 2:
									// if currently hovering on prefix, add 'forced'
									if (!this.currentOnMouseChildDom.classList.contains('prefix')) {
										break;
									}

									domContent.addClass('forced');
									break;
								default:
								}

								domContent.css({
									transform: `translateY(${index % 2 === 0 ? '' : '-'}${frame / 14}px)`,
								});
							},
						},
					});
				}

				menuContainerDom.appendChild(titleDom);
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
		};

		if (this.ctx.animations[-1]) {
			handler(this.ctx.animations[-1], -1);
		}

		this.ctx.animations.fastEach(handler);
	}

	private animateTitleHover(titleDom: $Object, state: 'over'| 'out'): void {
		let titleIndex: number = this.titles.length;
		let totalFrames = null;

		// get working title
		this.titles.forEach(
			(title, index: number) => {
				const {
					totalFrames: animationTotalFrames,
				} = title.hoverFrameAnimator.animations[0][0].items;

				if (title.domContent === titleDom) {
					titleIndex = index;
					totalFrames = animationTotalFrames;
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
		const options = {
			fps: 240,
		};

		if (hoverFrameAnimator.currentFrame === end
			&& end === 0) {
			hoverFrameAnimator.animate(
				end,
				end + 1,
				options,
			);
			return;
		}

		hoverFrameAnimator.animate(
			hoverFrameAnimator.currentFrame,
			end,
			options,
		);
	}

	private animateTitleReveal(titleDom: $Object, state: 'reveal' | 'hide'): void {
		let titleIndex: number = this.titles.length;
		let totalFrames = null;

		// get working title
		this.titles.forEach(
			(title, index: number) => {
				const {
					totalFrames: animationTotalFrames,
				} = title.hoverFrameAnimator.animations[0][0].items;

				if (title.domContent === titleDom) {
					titleIndex = index;
					totalFrames = animationTotalFrames;
				}
			},
		);

		let end = null;
		let speed = null;

		switch (state) {
		case 'reveal':
			end = totalFrames;
			speed = 1;
			break;
		case 'hide':
			end = 0;
			speed = 2;
			break;
		default:
			return;
		}

		const { revealFrameAnimator } = this.titles[titleIndex];

		if (revealFrameAnimator.currentFrame === end) {
			revealFrameAnimator.animate(
				end,
				end + 1,
			);
			return;
		}

		revealFrameAnimator.animate(
			revealFrameAnimator.currentFrame,
			end,
			{
				speed,
			},
		);
	}

	private onWindowResize(): void {
		if (this.isOpen) {
			this.animateOpenHamburger();
			return;
		}

		this.animateCloseHamburger();
	}
}
