import { AnimationObject } from '../../animator.types.js';

export interface LottieObject {
	className: string;
	// using the return object from lottie, which is a vanilla library
	animation: any;
	totalFrames: number;
	onFrame?: (animationObject: AnimationObject, frame: number) => void;
}
