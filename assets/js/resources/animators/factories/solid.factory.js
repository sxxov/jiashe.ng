var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CoreAnimator } from '../../animators.js';
import { $ } from '../../utilities.js';
export class SolidFactory {
    constructor(thisArg) {
        this.ctx = thisArg;
    }
    create(animationObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid, __container, } = animationObject.items;
            const className = uid;
            const domContent = this.createAndReturnDomContent(className);
            __container.appendChild(domContent);
            const solidObject = {
                domContent,
            };
            return solidObject;
        });
    }
    createAndReturnDomContent(className) {
        const domContent = $(document.createElement('div'));
        domContent.css({
            width: '100vw',
            height: '100vh',
            background: 'white',
            position: 'absolute',
        });
        domContent.addClass([
            CoreAnimator.PREFIX,
            'solid',
            className,
            'hidden',
        ]);
        return domContent;
    }
}
//# sourceMappingURL=solid.factory.js.map