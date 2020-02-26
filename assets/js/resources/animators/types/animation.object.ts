import { $Object } from '../../utilities.types.js';
import { LottieObject } from '../../animator.types.js';

export interface AnimationObject {
	type: string;
	index?: number;
	data?: unknown;
	items?: {
		__caller?: any;
		uid?: string;
		domContent?: $Object;
		yOffset?: number;
		lottieObject?: LottieObject;
		respectDevicePixelRatio?: boolean;
		totalFrames?: number;
		invert?: boolean;
		maximumHeight?: number;
		maximumWidth?: number;
		minimumHeight?: number;
		minimumWidth?: number;
		onFrame?: (animationObject: AnimationObject, frame: number) => void;
		onVisible?: (animationObject: AnimationObject) => void;
		onHidden?: (animationObject: AnimationObject) => void;
		onRedraw?: (animationObject: AnimationObject) => void;
	};
}
