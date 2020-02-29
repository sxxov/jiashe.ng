import { $ } from '../utilities.js';

export class WindowUtility {
	get inner(): {
		height: number;
		width: number;
		} {
		return {
			height: window.innerHeight,
			width: window.innerWidth,
		};
	}

	get viewport(): {
		height: number;
		width: number;
		} {
		const viewportCalibrator = $('.__windowUtility.viewportCalibrator');
		const height = viewportCalibrator.offsetHeight;
		const width = viewportCalibrator.offsetWidth;

		return {
			height,
			width,
		};
	}
}
