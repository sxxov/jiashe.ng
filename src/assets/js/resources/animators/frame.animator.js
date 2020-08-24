import { CoreAnimator } from './core.animator';
export class FrameAnimator extends CoreAnimator {
    async animate(from, to, options = {}) {
        return this.rawAnimate({
            from,
            to,
            options,
        }, (frame) => {
            super.onFrame(frame);
        });
    }
    async repeat(from, to, options = {}) {
        for (;;) {
            await this.animate(from, to, options);
        }
    }
    cancelNextFrame() {
        cancelAnimationFrame(this.rafId);
    }
}
//# sourceMappingURL=frame.animator.js.map