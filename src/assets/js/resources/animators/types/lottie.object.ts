import { AnimationObject } from '../../animator.types.js';
import { $Object } from '../../utilities.types.js';

export interface LottieObject {
	// using the return object from lottie, which is a vanilla library
	animation: any;
	totalFrames: number;
	domContent: $Object;
	onFrame?: (animationObject: AnimationObject, frame: number) => void;
}
