var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $, BezierUtility } from '../../../assets/js/resources/utilities.js';
const { marked } = window;
class Main {
    constructor() {
        this.skinDom = $('.skin');
        this.scrollRafId = null;
        this.mBezierUtility = new BezierUtility(0.075, 0.82, 0.165, 1);
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            this.skinDom.innerHTML = marked(yield (yield fetch(this.uri)).text());
        });
    }
    get uri() {
        let uri = String(window.location.href);
        uri = uri.substr(uri.indexOf('#') + 1);
        uri += uri.substr(-3) === '.md' ? '' : '.md';
        uri = `/assets/md/${uri}`;
        return uri;
    }
    onVerticalScroll(event) {
        if (!event.deltaY) {
            return;
        }
        const delta = event.deltaY + event.deltaX;
        cancelAnimationFrame(this.scrollRafId);
        const currentTarget = $(event.currentTarget);
        currentTarget.scrollLeft = this.expectedScrollLeft;
        if (currentTarget.scrollLeft !== this.expectedScrollLeft) {
            this.expectedScrollLeft = Number(currentTarget.scrollLeft);
            return;
        }
        this.cachedScrollLeft = this.expectedScrollLeft;
        this.expectedScrollLeft += delta;
        let i = 0;
        const handler = () => {
            const magic = this.mBezierUtility.getValue((Math.abs(i))
                / Math.abs(delta)) * delta;
            switch (true) {
                case delta < 0: {
                    if (i < delta) {
                        return;
                    }
                    i -= 2;
                    break;
                }
                case delta > 0: {
                    if (i > delta) {
                        return;
                    }
                    i += 2;
                    break;
                }
                default: {
                    return;
                }
            }
            currentTarget.scrollLeft = magic + this.cachedScrollLeft;
            this.scrollRafId = requestAnimationFrame(() => handler());
        };
        this.scrollRafId = requestAnimationFrame(() => handler());
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    (new Main()).create();
}))();
//# sourceMappingURL=main.js.map