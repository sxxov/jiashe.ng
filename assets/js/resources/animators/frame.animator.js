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
export class FrameAnimator extends CoreAnimator {
    animate(from, to, options = {}) {
        const _super = Object.create(null, {
            onFrame: { get: () => super.onFrame }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return this.rawAnimate({
                from,
                to,
                options,
            }, (frame) => {
                _super.onFrame.call(this, frame);
            });
        });
    }
    repeat(from, to, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            for (;;) {
                yield this.animate(from, to, options);
            }
        });
    }
    cancelNextFrame() {
        cancelAnimationFrame(super.rafId);
    }
}
//# sourceMappingURL=frame.animator.js.map