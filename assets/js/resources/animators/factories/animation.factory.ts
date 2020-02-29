import { CoreAnimator } from '../core.animator.js';
import { AnimationObject } from '../../animator.types.js';
import { $ } from '../../utilities.js';
import { $Object } from '../../utilities.types.js';

export class AnimationFactory {
	private ctx: CoreAnimator;

	public constructor(thisArg: CoreAnimator) {
		this.ctx = thisArg;
	}

	create(options: AnimationObject, thisArg: CoreAnimator): AnimationObject {
		const baseObject: AnimationObject = {
			type: undefined,
			index: undefined,
			data: undefined,
			...options,
		};

		const baseItemsObject: AnimationObject['items'] = {
			__caller: thisArg.constructor,
			__container: options.type === 'null' || options.type === 'meta' ? null : this.createAndReturnNewContainerDom(options),
			uid: Math.round(performance.now()).toString(),
			domContent: null,
			offset: 0,
			object: {},
			respectDevicePixelRatio: true,
			totalFrames: null,
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
			this.ctx.animatorClassPrefix,
			'container',
			Math.round(performance.now()).toString(),
			'height',
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
