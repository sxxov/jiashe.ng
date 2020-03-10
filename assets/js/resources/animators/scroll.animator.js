var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CoreAnimator } from './core.animator.js';
import { $ } from '../utilities.js';
export class ScrollAnimator extends CoreAnimator {
    constructor() {
        super();
        this.nextOnScrollCancelled = false;
        $(window).on('scroll', () => window.requestAnimationFrame(() => this.onScroll.call(this)));
    }
    // @Override
    add(animationToBeConstructed) {
        const _super = Object.create(null, {
            add: { get: () => super.add }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.add.call(this, animationToBeConstructed);
            const windowHeight = this.mWindowUtility.viewport.height;
            const documentHeight = windowHeight * (this.animations.length + 1);
            $(document.body).css({
                height: documentHeight,
            });
            this.onScroll();
        });
    }
    onSeek(frame) {
        this.nextOnScrollCancelled = true;
        window.scrollTo(0, (frame / this.totalFrames)
            * (document.body.scrollHeight - this.mWindowUtility.viewport.height));
    }
    onScroll() {
        if (this.nextOnScrollCancelled) {
            this.nextOnScrollCancelled = false;
            return;
        }
        const { scrollY } = window;
        const globalFrame = this.getRelativeFrame(scrollY / (document.body.scrollHeight - this.mWindowUtility.viewport.height));
        this.onFrame(globalFrame);
    }
}
//# sourceMappingURL=scroll.animator.js.map