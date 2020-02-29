import { $ } from '../utilities.js';
export class WindowUtility {
    get inner() {
        return {
            height: window.innerHeight,
            width: window.innerWidth,
        };
    }
    get viewport() {
        const viewportCalibrator = $('.__windowUtility.viewportCalibrator');
        const height = viewportCalibrator.offsetHeight;
        const width = viewportCalibrator.offsetWidth;
        return {
            height,
            width,
        };
    }
}
//# sourceMappingURL=window.utility.js.map