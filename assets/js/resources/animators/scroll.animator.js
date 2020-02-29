import { CoreAnimator } from './core.animator.js';
import { $ } from '../utilities.js';
export class ScrollAnimator extends CoreAnimator {
    constructor() {
        super();
        this.viewportCache = {
            height: null,
            width: null,
        };
        $(window).on('scroll', () => window.requestAnimationFrame(() => this.onScroll.call(this)));
    }
    // @Override
    onWindowResize() {
        this.viewportCache = {
            width: this.mWindowUtility.viewport.width,
            height: this.mWindowUtility.viewport.height,
        };
        const windowWidth = this.viewportCache.width;
        const windowHeight = this.viewportCache.height;
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
        const globalFrame = this.getRelativeFrame(scrollY / (document.body.scrollHeight - this.viewportCache.height));
        this.onFrame(globalFrame);
    }
}
//# sourceMappingURL=scroll.animator.js.map