import { CoreAnimator } from './core.animator';
import { $ } from '../utilities/$.utility';
import { WindowUtility } from '../utilities/window.utility';
export class ScrollAnimator extends CoreAnimator {
    constructor() {
        super();
        this.nextOnScrollCancelled = false;
        this.responsibleForLastResize = false;
        $(window).on('scroll', () => window.requestAnimationFrame(() => this.onScroll.call(this)));
    }
    // @Override
    async add(animationToBeConstructed) {
        const result = await super.add(animationToBeConstructed);
        this.onWindowResize();
        this.onScroll();
        return result;
    }
    // @Override
    onWindowResize() {
        super.onWindowResize();
        const windowHeight = WindowUtility.viewport.height;
        const documentHeight = windowHeight * (this.animations.length + 1);
        if (!(documentHeight > (Number.parseInt($(document.body).css('height'), 10) || 0)
            || this.responsibleForLastResize)) {
            this.responsibleForLastResize = false;
            return;
        }
        this.responsibleForLastResize = true;
        $(document.body).css({
            height: documentHeight,
        });
    }
    // @Override
    onSeek(frame) {
        const yOffset = Math.max(Math.ceil((frame / this.totalFrames)
            * (document.body.offsetHeight - WindowUtility.viewport.height)) + 7, 0);
        this.scrollTo({
            left: 0,
            top: yOffset,
            behavior: 'smooth',
        }, () => {
            this.onFrame(frame);
        });
    }
    // @Override
    seekTo(scrollPosition) {
        this.scrollTo({
            left: 0,
            top: scrollPosition,
            behavior: 'smooth',
        }, () => {
            this.onFrame(scrollPosition);
        });
    }
    scrollTo(scrollOptions, callback) {
        const { top = 0, left = 0, behavior, } = scrollOptions;
        const onScroll = () => {
            // floor both values as some browsers support decimals while some don't
            if (Math.floor(window.pageYOffset) === Math.floor(top)
                && Math.floor(window.pageXOffset) === Math.floor(left)) {
                this.nextOnScrollCancelled = true;
                window.removeEventListener('scroll', onScroll);
                if (!callback) {
                    return;
                }
                callback();
            }
        };
        window.addEventListener('scroll', onScroll);
        onScroll();
        window.scrollTo({
            top,
            behavior,
        });
    }
    onScroll() {
        if (this.nextOnScrollCancelled) {
            this.nextOnScrollCancelled = false;
            return;
        }
        const { scrollY } = window;
        const globalFrame = this.getRelativeFrame(scrollY / (Math.min(document.body.scrollHeight, WindowUtility.viewport.height * (this.animations.length + 1))
            - WindowUtility.viewport.height));
        this.onFrame(globalFrame);
    }
}
//# sourceMappingURL=scroll.animator.js.map