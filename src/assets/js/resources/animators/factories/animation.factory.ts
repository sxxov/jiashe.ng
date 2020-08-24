import { CoreAnimator } from '../core.animator.js';
import { AnimationObject } from '../types/animation.object.js';
import { $Object } from '../../utilities/types/$.object.js';
import { $ } from '../../utilities/$.utility.js';

export class AnimationFactory {
	private ctx: CoreAnimator;

	public constructor(thisArg: CoreAnimator) {
		this.ctx = thisArg;
	}

	create(options: AnimationObject): AnimationObject {
		const baseObject: AnimationObject = {
			type: undefined,
			index: undefined,
			data: undefined,
			...options,
		};

		const baseItemsObject: AnimationObject['items'] = {
			__caller: this.ctx.constructor,
			__container: options.type === 'null' || options.type === 'meta' ? null : this.createAndReturnNewContainerDom(options),
			__framesBeforeCurrent: this.ctx.getTotalFramesBeforeIndex(options.index || 0),
			uid: Math.round(performance.now()).toString(),
			domContent: null,
			offset: 0,
			disabled: false,
			object: {},
			respectDevicePixelRatio: true,
			totalFrames: null,
			bezier: [0, 0, 1, 1],
			height: {
				maximum: null,
				minimum: null,
			},
			width: {
				maximum: null,
				minimum: null,
			},
			onFrame: (): void => {},
			onVisible: (): void => {},
			onHidden: (): void => {},
			onRedraw: (): void => {},
			...options.items,
		};

		return {
			...baseObject,
			items: baseItemsObject,
		};
	}

	private createAndReturnNewContainerDom(animationObject: AnimationObject): $Object {
		const animatorContainer = $(document.createElement('div'));

		animatorContainer.addClass([
			CoreAnimator.PREFIX,
			'container',
			Math.round(performance.now()).toString(),
		]);

		if (animationObject
			.items
			.invert === true) {
			animatorContainer.addClass('invert');
		}

		this.ctx.activate(animatorContainer);

		this.ctx.animatorContainersWrapper.appendChild(animatorContainer);

		this.ctx.animatorContainers.push(animatorContainer);

		return animatorContainer;
	}
}
