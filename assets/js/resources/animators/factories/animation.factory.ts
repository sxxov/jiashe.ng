import { CoreAnimator } from '../core.animator.js';
import { AnimationObject } from '../../animator.types.js';

export class AnimationFactory {
	create(options: AnimationObject, thisArg: CoreAnimator): AnimationObject {
		const baseObject: AnimationObject = {
			type: undefined,
			index: undefined,
			data: undefined,
			...options,
		};

		const baseItemsObject: AnimationObject['items'] = {
			__caller: thisArg.constructor,
			uid: Date.now().toString(),
			domContent: null,
			offset: 0,
			object: {},
			respectDevicePixelRatio: true,
			totalFrames: null,
			maximumHeight: 0,
			maximumWidth: 0,
			minimumHeight: 0,
			minimumWidth: 0,
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
}
