import { CoreAnimator } from './core.animator.js';
import { $ } from '../utilities.js';
export class ScrollAnimator extends CoreAnimator {
    constructor() {
        super();
        $(window).on('scroll', () => window.requestAnimationFrame(() => this.onScroll.call(this)));
    }
    // @Override
    onWindowResize() {
        const windowWidth = this.mWindowUtility.viewport.width;
        const windowHeight = this.mWindowUtility.viewport.height;
        const documentHeight = windowHeight * (this.animations.length + 1);
        const documentWidth = windowWidth;
        $(document.body).css({
            width: documentWidth,
            height: documentHeight,
        });
        super.onWindowResize();
    }
    onScroll() {
        const { scrollY } = window;
        const globalFrame = this.getRelativeFrame(scrollY / (document.body.scrollHeight - this.mWindowUtility.viewport.height));
        this.onFrame(globalFrame);
    }
}
//# sourceMappingURL=scroll.animator.js.map